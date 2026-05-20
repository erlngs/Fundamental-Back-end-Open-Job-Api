exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: { type: 'VARCHAR(50)', primaryKey: true },
    company_id: { type: 'VARCHAR(50)', notNull: true, references: '"companies"', onDelete: 'CASCADE' },
    category_id: { type: 'VARCHAR(50)', notNull: true, references: '"categories"', onDelete: 'CASCADE' },
    title: { type: 'VARCHAR(150)', notNull: true },
    description: { type: 'TEXT' },
    requirements: { type: 'TEXT' },
    location: { type: 'VARCHAR(150)' },
    location_type: { type: 'VARCHAR(50)' },
    location_city: { type: 'VARCHAR(150)' },
    salary_min: { type: 'BIGINT' },
    salary_max: { type: 'BIGINT' },
    is_salary_visible: { type: 'BOOLEAN', default: true },
    job_type: { type: 'VARCHAR(50)' },
    experience_level: { type: 'VARCHAR(50)' },
    status: { type: 'VARCHAR(20)', notNull: true, default: 'open' },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('NOW()') },
  });
};
exports.down = (pgm) => pgm.dropTable('jobs');