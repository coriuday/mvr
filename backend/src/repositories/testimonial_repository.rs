use crate::{
    models::testimonial::{CreateTestimonialRequest, Testimonial, TestimonialFilter},
    utils::errors::{AppError, AppResult},
};
use sqlx::PgPool;
use uuid::Uuid;

pub struct TestimonialRepository {
    pub db: PgPool,
}

impl TestimonialRepository {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn find_all(&self, filter: &TestimonialFilter) -> AppResult<Vec<Testimonial>> {
        const SELECT: &str = r#"
            SELECT id, student_name, review, image_url, rating,
                   country, university, course, is_featured, created_at
            FROM testimonials
        "#;

        let testimonials = match filter.featured {
            Some(featured) => {
                sqlx::query_as::<_, Testimonial>(&format!(
                    "{SELECT} WHERE is_featured = $1 ORDER BY is_featured DESC, created_at DESC"
                ))
                .bind(featured)
                .fetch_all(&self.db)
                .await
            }
            None => {
                sqlx::query_as::<_, Testimonial>(&format!(
                    "{SELECT} ORDER BY is_featured DESC, created_at DESC"
                ))
                .fetch_all(&self.db)
                .await
            }
        }
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;

        Ok(testimonials)
    }

    pub async fn create(&self, req: &CreateTestimonialRequest) -> AppResult<Testimonial> {
        sqlx::query_as::<_, Testimonial>(
            r#"
            INSERT INTO testimonials
              (student_name, review, image_url, rating, country, university, course, is_featured)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, student_name, review, image_url, rating,
                      country, university, course, is_featured, created_at
            "#,
        )
        .bind(&req.student_name)
        .bind(&req.review)
        .bind(&req.image_url)
        .bind(req.rating)
        .bind(&req.country)
        .bind(&req.university)
        .bind(&req.course)
        .bind(req.is_featured.unwrap_or(false))
        .fetch_one(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))
    }

    pub async fn update(&self, id: Uuid, body: &serde_json::Value) -> AppResult<Testimonial> {
        let row = sqlx::query_as::<_, Testimonial>(
            r#"
            UPDATE testimonials SET
              student_name  = COALESCE($2, student_name),
              review        = COALESCE($3, review),
              image_url     = COALESCE($4, image_url),
              rating        = COALESCE($5, rating),
              country       = COALESCE($6, country),
              university    = COALESCE($7, university),
              course        = COALESCE($8, course),
              is_featured   = COALESCE($9, is_featured)
            WHERE id = $1
            RETURNING id, student_name, review, image_url, rating,
                      country, university, course, is_featured, created_at
            "#,
        )
        .bind(id)
        .bind(body.get("student_name").and_then(|v| v.as_str()))
        .bind(body.get("review").and_then(|v| v.as_str()))
        .bind(body.get("image_url").and_then(|v| v.as_str()))
        .bind(
            body.get("rating")
                .and_then(|v| v.as_i64())
                .map(|r| r as i32),
        )
        .bind(body.get("country").and_then(|v| v.as_str()))
        .bind(body.get("university").and_then(|v| v.as_str()))
        .bind(body.get("course").and_then(|v| v.as_str()))
        .bind(body.get("is_featured").and_then(|v| v.as_bool()))
        .fetch_optional(&self.db)
        .await
        .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("Testimonial {id} not found")))?;
        Ok(row)
    }

    pub async fn delete(&self, id: Uuid) -> AppResult<()> {
        let result = sqlx::query("DELETE FROM testimonials WHERE id = $1")
            .bind(id)
            .execute(&self.db)
            .await
            .map_err(|e| AppError::InternalServerError(format!("DB error: {e}")))?;
        if result.rows_affected() == 0 {
            return Err(AppError::NotFound(format!("Testimonial {id} not found")));
        }
        Ok(())
    }
}
