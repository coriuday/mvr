// Handlers are thin — they delegate to services
// In this architecture routes/ files serve as handlers directly for simplicity
// Dedicated handler files will be extracted in Phase 2 if needed
pub mod auth_handler;
pub mod blog_handler;
pub mod lead_handler;
pub mod university_handler;
