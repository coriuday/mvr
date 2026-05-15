use sqlx::PgPool;
pub struct UniversityRepository { pub db: PgPool }
impl UniversityRepository { pub fn new(db: PgPool) -> Self { Self { db } } }
