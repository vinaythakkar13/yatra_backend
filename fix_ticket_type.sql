-- Run this query in your database management tool (Aiven console, MySQL Workbench, etc.)

ALTER TABLE yatra_registrations 
MODIFY COLUMN ticket_type ENUM(
    'FLIGHT', 
    'BUS', 
    'FIRST_AC', 
    'SECOND_AC', 
    'THIRD_AC', 
    'SLEEPER', 
    'GENERAL', 
    'TBS', 
    'WL', 
    'RAC'
) DEFAULT NULL;
