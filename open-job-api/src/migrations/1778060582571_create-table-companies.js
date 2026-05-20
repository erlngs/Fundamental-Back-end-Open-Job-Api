exports.up = (pgm) => {
  pgm.createTable('companies', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    user_id: { type: 'VARCHAR(50)', notNull: true, references: '"users"', onDelete: 'CASCADE' },
    name: { type: 'VARCHAR(150)', notNull: true, unique: true },
    description: { type: 'TEXT' },
    industry: { type: 'VARCHAR(100)' },
    location: { type: 'VARCHAR(150)' },
    website: { type: 'VARCHAR(255)' },
    logo_url: { type: 'TEXT' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
  });
};
exports.down = (pgm) => pgm.dropTable('companies');