const LearningPath = require('../models/LearningPath');

const sampleLearningPaths = [
    {
        company: 'Google',
        title: 'Software Engineer Preparation Path',
        description: 'Comprehensive preparation for Google Software Engineer positions focusing on algorithms, system design, and coding skills.',
        skills: [
            {
                name: 'Data Structures and Algorithms',
                description: 'Master fundamental data structures and algorithmic thinking',
                difficulty: 'intermediate',
                estimatedHours: 40,
                category: 'algorithms',
                priority: 10,
                resources: [
                    {
                        type: 'course',
                        title: 'Algorithms Specialization',
                        url: 'https://www.coursera.org/specializations/algorithms',
                        provider: 'Coursera',
                        duration: 240,
                        difficulty: 'intermediate'
                    },
                    {
                        type: 'practice',
                        title: 'LeetCode Algorithm Problems',
                        url: 'https://leetcode.com/problemset/algorithms/',
                        provider: 'LeetCode',
                        duration: 60,
                        difficulty: 'intermediate'
                    },
                    {
                        type: 'video',
                        title: 'Data Structures Easy to Advanced Course',
                        url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
                        provider: 'YouTube',
                        duration: 480,
                        difficulty: 'beginner'
                    }
                ]
            },
            {
                name: 'System Design',
                description: 'Learn to design scalable distributed systems',
                difficulty: 'advanced',
                estimatedHours: 30,
                category: 'system-design',
                priority: 9,
                resources: [
                    {
                        type: 'course',
                        title: 'Grokking the System Design Interview',
                        url: 'https://www.educative.io/courses/grokking-the-system-design-interview',
                        provider: 'Other',
                        duration: 180,
                        difficulty: 'advanced'
                    },
                    {
                        type: 'article',
                        title: 'High Scalability Blog',
                        url: 'http://highscalability.com/',
                        provider: 'Other',
                        duration: 30,
                        difficulty: 'intermediate'
                    }
                ]
            },
            {
                name: 'Python Programming',
                description: 'Advanced Python programming concepts and best practices',
                difficulty: 'intermediate',
                estimatedHours: 25,
                category: 'programming',
                priority: 8,
                resources: [
                    {
                        type: 'course',
                        title: 'Python for Everybody Specialization',
                        url: 'https://www.coursera.org/specializations/python',
                        provider: 'Coursera',
                        duration: 200,
                        difficulty: 'beginner'
                    },
                    {
                        type: 'documentation',
                        title: 'Python Official Documentation',
                        url: 'https://docs.python.org/3/',
                        provider: 'Other',
                        duration: 60,
                        difficulty: 'intermediate'
                    }
                ]
            }
        ],
        estimatedDuration: 95,
        difficulty: 'intermediate',
        roles: ['Software Engineer', 'Backend Developer', 'Full Stack Developer'],
        tags: ['algorithms', 'system-design', 'python', 'coding-interview']
    },
    {
        company: 'Microsoft',
        title: 'Software Development Engineer Path',
        description: 'Preparation path for Microsoft SDE roles with focus on C#, .NET, and cloud technologies.',
        skills: [
            {
                name: 'C# and .NET Framework',
                description: 'Master C# programming and .NET ecosystem',
                difficulty: 'intermediate',
                estimatedHours: 35,
                category: 'programming',
                priority: 10,
                resources: [
                    {
                        type: 'course',
                        title: 'C# Programming for Unity Game Development',
                        url: 'https://www.coursera.org/specializations/programming-unity-game-development',
                        provider: 'Coursera',
                        duration: 180,
                        difficulty: 'intermediate'
                    },
                    {
                        type: 'documentation',
                        title: 'Microsoft .NET Documentation',
                        url: 'https://docs.microsoft.com/en-us/dotnet/',
                        provider: 'Other',
                        duration: 120,
                        difficulty: 'intermediate'
                    }
                ]
            },
            {
                name: 'Azure Cloud Services',
                description: 'Learn Microsoft Azure cloud platform and services',
                difficulty: 'intermediate',
                estimatedHours: 30,
                category: 'devops',
                priority: 9,
                resources: [
                    {
                        type: 'course',
                        title: 'Microsoft Azure Fundamentals',
                        url: 'https://docs.microsoft.com/en-us/learn/paths/azure-fundamentals/',
                        provider: 'Other',
                        duration: 240,
                        difficulty: 'beginner'
                    }
                ]
            },
            {
                name: 'Software Engineering Principles',
                description: 'Best practices in software development and engineering',
                difficulty: 'intermediate',
                estimatedHours: 20,
                category: 'soft-skills',
                priority: 7,
                resources: [
                    {
                        type: 'article',
                        title: 'Clean Code Principles',
                        url: 'https://blog.cleancoder.com/',
                        provider: 'Other',
                        duration: 60,
                        difficulty: 'intermediate'
                    }
                ]
            }
        ],
        estimatedDuration: 85,
        difficulty: 'intermediate',
        roles: ['Software Development Engineer', 'Cloud Developer', '.NET Developer'],
        tags: ['csharp', 'dotnet', 'azure', 'cloud', 'microsoft']
    },
    {
        company: 'Amazon',
        title: 'Software Development Engineer Path',
        description: 'Complete preparation for Amazon SDE interviews focusing on leadership principles and technical excellence.',
        skills: [
            {
                name: 'Java Programming',
                description: 'Advanced Java programming and object-oriented design',
                difficulty: 'intermediate',
                estimatedHours: 30,
                category: 'programming',
                priority: 9,
                resources: [
                    {
                        type: 'course',
                        title: 'Java Programming Masterclass',
                        url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/',
                        provider: 'Udemy',
                        duration: 800,
                        difficulty: 'beginner'
                    },
                    {
                        type: 'practice',
                        title: 'HackerRank Java Challenges',
                        url: 'https://www.hackerrank.com/domains/java',
                        provider: 'HackerRank',
                        duration: 120,
                        difficulty: 'intermediate'
                    }
                ]
            },
            {
                name: 'AWS Cloud Platform',
                description: 'Amazon Web Services fundamentals and advanced concepts',
                difficulty: 'intermediate',
                estimatedHours: 40,
                category: 'devops',
                priority: 10,
                resources: [
                    {
                        type: 'course',
                        title: 'AWS Certified Solutions Architect',
                        url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
                        provider: 'Other',
                        duration: 300,
                        difficulty: 'intermediate'
                    }
                ]
            },
            {
                name: 'Leadership Principles',
                description: 'Understanding Amazon\'s leadership principles and behavioral interviews',
                difficulty: 'beginner',
                estimatedHours: 15,
                category: 'soft-skills',
                priority: 8,
                resources: [
                    {
                        type: 'article',
                        title: 'Amazon Leadership Principles',
                        url: 'https://www.amazon.jobs/en/principles',
                        provider: 'Other',
                        duration: 30,
                        difficulty: 'beginner'
                    }
                ]
            }
        ],
        estimatedDuration: 85,
        difficulty: 'intermediate',
        roles: ['Software Development Engineer', 'Cloud Engineer', 'Backend Developer'],
        tags: ['java', 'aws', 'leadership-principles', 'amazon', 'cloud']
    },
    {
        company: 'Meta',
        title: 'Software Engineer Path',
        description: 'Preparation for Meta (Facebook) Software Engineer roles with emphasis on scalability and user experience.',
        skills: [
            {
                name: 'JavaScript and React',
                description: 'Modern JavaScript and React development',
                difficulty: 'intermediate',
                estimatedHours: 35,
                category: 'web-development',
                priority: 10,
                resources: [
                    {
                        type: 'course',
                        title: 'React - The Complete Guide',
                        url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
                        provider: 'Udemy',
                        duration: 480,
                        difficulty: 'intermediate'
                    },
                    {
                        type: 'documentation',
                        title: 'React Official Documentation',
                        url: 'https://reactjs.org/docs/getting-started.html',
                        provider: 'Other',
                        duration: 120,
                        difficulty: 'intermediate'
                    }
                ]
            },
            {
                name: 'Mobile Development',
                description: 'React Native and mobile app development',
                difficulty: 'intermediate',
                estimatedHours: 30,
                category: 'mobile-development',
                priority: 8,
                resources: [
                    {
                        type: 'course',
                        title: 'React Native - The Practical Guide',
                        url: 'https://www.udemy.com/course/react-native-the-practical-guide/',
                        provider: 'Udemy',
                        duration: 300,
                        difficulty: 'intermediate'
                    }
                ]
            },
            {
                name: 'Large Scale Systems',
                description: 'Building systems that serve billions of users',
                difficulty: 'advanced',
                estimatedHours: 25,
                category: 'system-design',
                priority: 9,
                resources: [
                    {
                        type: 'article',
                        title: 'Facebook Engineering Blog',
                        url: 'https://engineering.fb.com/',
                        provider: 'Other',
                        duration: 60,
                        difficulty: 'advanced'
                    }
                ]
            }
        ],
        estimatedDuration: 90,
        difficulty: 'intermediate',
        roles: ['Software Engineer', 'Frontend Developer', 'Mobile Developer'],
        tags: ['javascript', 'react', 'react-native', 'mobile', 'scalability']
    },
    {
        company: 'Netflix',
        title: 'Senior Software Engineer Path',
        description: 'Advanced preparation for Netflix engineering roles focusing on microservices and streaming technologies.',
        skills: [
            {
                name: 'Microservices Architecture',
                description: 'Design and implement microservices-based systems',
                difficulty: 'advanced',
                estimatedHours: 40,
                category: 'system-design',
                priority: 10,
                resources: [
                    {
                        type: 'course',
                        title: 'Microservices with Spring Boot and Spring Cloud',
                        url: 'https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/',
                        provider: 'Udemy',
                        duration: 180,
                        difficulty: 'advanced'
                    }
                ]
            },
            {
                name: 'Distributed Systems',
                description: 'Understanding distributed computing and fault tolerance',
                difficulty: 'advanced',
                estimatedHours: 35,
                category: 'system-design',
                priority: 9,
                resources: [
                    {
                        type: 'course',
                        title: 'Distributed Systems Course',
                        url: 'https://www.edx.org/course/distributed-systems',
                        provider: 'Other',
                        duration: 240,
                        difficulty: 'advanced'
                    }
                ]
            },
            {
                name: 'Performance Optimization',
                description: 'Optimizing applications for high performance and scale',
                difficulty: 'advanced',
                estimatedHours: 25,
                category: 'system-design',
                priority: 8,
                resources: [
                    {
                        type: 'article',
                        title: 'Netflix Tech Blog',
                        url: 'https://netflixtechblog.com/',
                        provider: 'Other',
                        duration: 60,
                        difficulty: 'advanced'
                    }
                ]
            }
        ],
        estimatedDuration: 100,
        difficulty: 'advanced',
        roles: ['Senior Software Engineer', 'Principal Engineer', 'Staff Engineer'],
        tags: ['microservices', 'distributed-systems', 'performance', 'streaming', 'netflix']
    }
];

const seedLearningPaths = async () => {
    try {
        // Check if learning paths already exist
        const existingCount = await LearningPath.countDocuments();
        if (existingCount > 0) {
            console.log(`${existingCount} learning paths already exist. Skipping seed.`);
            return;
        }

        // Insert sample learning paths
        const insertedPaths = await LearningPath.insertMany(sampleLearningPaths);
        console.log(`Successfully seeded ${insertedPaths.length} learning paths`);

        return insertedPaths;
    } catch (error) {
        console.error('Error seeding learning paths:', error);
        throw error;
    }
};

module.exports = { seedLearningPaths, sampleLearningPaths };