-- Database structure for the portfolio website

-- Create database
CREATE DATABASE IF NOT EXISTS portofolio;
USE portofolio;

-- Create profile table
CREATE TABLE IF NOT EXISTS profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    profession VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(255) NOT NULL,
    about_me TEXT NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255)
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    proficiency INT NOT NULL, -- Value from 0-100 for progress bars
    icon VARCHAR(50) -- Font Awesome or Lucide icon name
);

-- Create experience table
CREATE TABLE IF NOT EXISTS experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

-- Create social links table
CREATE TABLE IF NOT EXISTS social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NOT NULL -- Font Awesome or Lucide icon name
);

-- Insert data into profile
INSERT INTO profile (full_name, profession, profile_picture, about_me, email, phone, address)
VALUES (
    'ISHIMWE JEAN LUC',
    'Software Engineer',
    'images/nb.jpg',
    'Dynamic Software Engineer with hands-on experience, specializing in Backend. Proficient in containerization tools like Docker and skilled in problem-solving. Successfully optimized full-stack applications while fostering collaboration in Agile environments, driving innovative solutions that enhanced productivity and system functionality.',
    'ljeanluc394@gmail.com',
    '+250780079152',
    'Kigali, Rwanda'
);

-- Insert skills
INSERT INTO skills (name, proficiency, icon) VALUES
('Software Development', 90, 'fa-code'),
('Git', 85, 'fa-git-alt'),
('Docker', 80, 'fa-docker'),
('Java', 85, 'fa-java'),
('JavaScript', 90, 'fa-js'),
('C#', 80, 'fa-code'),
('Express.js', 85, 'fa-node-js'),
('React.js', 80, 'fa-react'),
('Spring Boot', 75, 'fa-leaf'),
('.NET', 75, 'fa-windows'),
('MySQL', 85, 'fa-database'),
('PostgreSQL', 80, 'fa-database'),
('Problem Solving', 90, 'fa-puzzle-piece'),
('UI/UX Design', 75, 'fa-palette');

-- Insert experience
INSERT INTO experience (position, company, start_date, end_date, description, is_current) VALUES
('Software Engineer', 'AUCA INNOVATION CENTER', '2025-02-01', NULL, 'Collaborative Project Development: Worked in a team of 10 on hands-on projects covering DevOps, Big Data Science, and Web Technologies. DevOps Implementation: Gained experience in CI/CD pipelines, containerization (Docker), and cloud deployment strategies. Big Data Processing: Worked with data analytics tools and frameworks to process large datasets efficiently. Web Technology Development: Built and optimized full-stack applications using modern web frameworks. Team Collaboration: Applied Agile methodologies, participated in stand-ups, and engaged in peer code reviews. Problem-Solving & Innovation: Researched and implemented innovative solutions to technical challenges in real-world projects.', TRUE),
('Software Engineer (Apprenticeship)', 'Power Learn Project', '2024-08-01', '2024-12-01', 'Developed user-friendly software by understanding client needs and technology constraints. Resolved complex programming issues to ensure uninterrupted system functionality. Achieved seamless software integration with efficient methodologies and unique platforms. Streamlined workflow to improve productivity via agile methodologies implementation.', FALSE),
('Bachelor of Science: Software Engineering', 'Adventist University of Central Africa', '2022-09-01', '2026-03-01', 'Education in Software Engineering with focus on modern development practices and technologies.', FALSE);

-- Insert social links
INSERT INTO social_links (platform, url, icon) VALUES
('GitHub', 'https://github.com/ishimwejeanluc', 'fa-github'),
('LinkedIn', 'https://linkedin.com/in/ishimwe-jean-luc-b36504259/', 'fa-linkedin'),
('Instagram', 'https://www.instagram.com/jean_luc_ishimwe/', 'fa-instagram'),
('Certificate', 'https://certificates.isoc.org/ea91c4cb-dd31-432e-abb6-b84c90e4841d', 'fa-certificate');
