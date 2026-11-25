-- OPTIONAL fake students for testing, matching the columns the migrations read.
-- If your student table has other NOT NULL columns, add them here before running.
-- Delete these rows before go-live, otherwise they will appear on real emergency sheets:
--   delete from public.student where parent_1_phone like '%-555-%';
insert into public.student
  (first_name, middle_name, last_name, date_of_birth, location, room, grade,
   parent_1_name, parent_1_phone, parent_1_email, parent_2_name, parent_2_phone, parent_2_email, media_release) values
 ('Liam',  'Alexander', 'Chen',       '2022-04-12', 'Brookside Campus',  'Kindergarten 1',   'JK',      'Marcus Chen',      '416-555-0192', 'marcus@example.com', 'Sarah Chen',       '416-555-0193', 'sarah@example.com',  'YES'),
 ('Maya',  'Fatima',    'Al-Mansoor', '2021-07-03', 'Meadowvale Campus', 'Kindergarten 2',   'SK',      'Tariq Al-Mansoor', '647-555-0144', 'tariq@example.com',  'Nadia Al-Mansoor', '647-555-0145', 'nadia@example.com',  'NO'),
 ('Rohan', 'Vikram',    'Kulkarni',   '2020-02-20', 'Brookside Campus',  'Lower Casa A',     'Grade 1', 'Vikram Kulkarni',  '416-555-0211', 'vikram@example.com', 'Anjali Kulkarni',  '416-555-0212', null,                 'YES'),
 ('Chloe', 'Elizabeth', 'Moreau',     '2018-09-15', 'Brookside Campus',  'Lower Casa B',     'Grade 2', 'Jean-Luc Moreau',  '647-555-0230', 'jl@example.com',     'Claire Moreau',    '647-555-0231', 'claire@example.com', 'YES'),
 ('David', 'Mateo',     'Hernandez',  '2017-10-30', 'Meadowvale Campus', 'Lower Casa C',     'Grade 3', 'Mateo Hernandez',  '905-555-0255', 'mateo@example.com',  'Sofia Hernandez',  '905-555-0256', null,                 null),
 ('Aria',  'Devika',    'Nair',       '2016-06-08', 'Brookside Campus',  'Upper Studio 1',   'Grade 4', 'Suresh Nair',      '416-555-0301', 'suresh@example.com', 'Kavita Nair',      '416-555-0302', 'kavita@example.com', 'NO'),
 ('Lucas', 'Benjamin',  'Wright',     '2015-03-19', 'Brookside Campus',  'Upper Studio 2',   'Grade 6', 'Daniel Wright',    '647-555-0320', 'daniel@example.com', 'Hannah Wright',    '647-555-0321', null,                 'YES'),
 ('Zara',  'Aminah',    'Siddiqui',   '2014-01-25', 'Meadowvale Campus', 'Senior Seminar 1', 'Grade 7', 'Bilal Siddiqui',   '905-555-0410', 'bilal@example.com',  'Amina Siddiqui',   '905-555-0411', 'amina@example.com',  'YES'),
 ('Evan',  'Thomas',    'Gallagher',  '2013-05-14', 'Meadowvale Campus', 'Senior Seminar 2', 'Grade 8', 'Thomas Gallagher', '416-555-0444', 'thomas@example.com', 'Rachel Gallagher', '416-555-0445', null,                 'NO');
