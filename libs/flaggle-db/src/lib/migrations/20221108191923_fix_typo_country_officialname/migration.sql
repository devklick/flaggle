-- create new column
ALTER TABLE country ADD COLUMN official_name CHARACTER VARYING(120) NULL;

-- copy data from old column to new column
UPDATE country SET official_name = offcial_name;

-- make new column non-nullable
ALTER TABLE country ALTER COLUMN official_name TYPE CHARACTER VARYING(120);
ALTER TABLE country ALTER COLUMN official_name SET NOT NULL;

-- drop old column
ALTER TABLE country DROP COLUMN offcial_name;
