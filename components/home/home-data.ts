import { BookOpen, Brain, Cloud, ShieldCheck, Workflow } from 'lucide-react';

export const objectives = [
  
  {
    number: '01',
    title: 'Technology Readiness',
    description:
      'Build strategic and technical readiness in Artificial Intelligence, Cyber Security, and Cloud through focused learning sessions.',
    icon: Brain,
    border: 'border-cyan-200',
  },
  {
    number: '02',
    title: 'Digital Transformation',
    description: 'Create a unified engagement platform to accelerate digital governance capability, collaboration, and transformation.',
    icon: Workflow,
    border: 'border-violet-200',
  },
  {
    number: '03',
    title: 'Strategic Visibility',
    description: 'Strengthen product awareness and visibility across Ministries, Departments, and State/UT administrations.',
    icon: BookOpen,
    border: 'border-blue-200',
  },
] as const;

export const sessions = [
  {
    title: 'Artificial Intelligence',
    description: 'Explore AI applications in government services and digital transformation',
    icon: Brain,
    image: '/aritificail-intelligence.png',
  },
  {
    title: 'Cyber Security',
    description: 'Learn critical security practices for protecting government infrastructure',
    icon: ShieldCheck,
    image: '/cyber-security.png',
  },
  {
    title: 'Cloud Computing',
    description: 'Understand cloud adoption strategies for scalable government solutions',
    icon: Cloud,
    image: '/cloud-computing.png',
  },
] as const;
