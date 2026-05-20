exports.up = (pgm) => {
  pgm.createTable('bookmarks', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    job_id: { type: 'VARCHAR(50)', notNull: true, references: '"jobs"', onDelete: 'CASCADE' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('bookmarks', 'unique_user_job_bookmark', 'UNIQUE(user_id, job_id)');
};
exports.down = (pgm) => pgm.dropTable('bookmarks');