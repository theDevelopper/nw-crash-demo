# Database Migration Files

In this folder you find Database Migration files. These files are needed to keep database schema changes consitent and easy to manage.

Each migration needs to have a section for the changes (Up) and one for reverting the cahnges (Down). A migration file looks like this:

```sql
-- Up
CREATE TABLE Category (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE Post (id INTEGER PRIMARY KEY, categoryId INTEGER, title TEXT,
  CONSTRAINT Post_fk_categoryId FOREIGN KEY (categoryId)
    REFERENCES Category (id) ON UPDATE CASCADE ON DELETE CASCADE);

-- Down
DROP TABLE Category
DROP TABLE Post;
```

Please number the migrations files. File `0001` is the initial schema setup and is the only one wihtour a Down section for legacy reasons.
