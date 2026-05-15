use sqlx::PgPool;
pub struct BlogRepository { pub db: PgPool }
impl BlogRepository { pub fn new(db: PgPool) -> Self { Self { db } } }
