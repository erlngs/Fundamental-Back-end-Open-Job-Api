exports.up = (pgm) => {
  pgm.createTable('documents', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    name: { type: 'VARCHAR(150)', notNull: true },
    file_url: { type: 'TEXT', notNull: true },
    file_type: { type: 'VARCHAR(50)' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
  });
};
exports.down = (pgm) => pgm.dropTable('documents');