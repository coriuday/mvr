use sqlx::PgPool;
pub struct LeadRepository { pub db: PgPool }
impl LeadRepository { pub fn new(db: PgPool) -> Self { Self { db } } }
