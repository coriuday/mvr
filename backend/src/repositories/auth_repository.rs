use sqlx::PgPool;
// TODO: Phase 2 — implement user DB queries
pub struct AuthRepository { pub db: PgPool }
impl AuthRepository { pub fn new(db: PgPool) -> Self { Self { db } } }
