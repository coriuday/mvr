/// Run with: cargo run --example hash_password -- "YourPasswordHere"
/// Copy the printed hash into the Supabase SQL INSERT.
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};

fn main() {
    let password = std::env::args()
        .nth(1)
        .expect("Usage: cargo run --example hash_password -- \"YourPassword\"");

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .expect("Hashing failed")
        .to_string();

    println!("\n✅ Password hash (copy this into Supabase SQL):\n");
    println!("{}", hash);
    println!();
}
