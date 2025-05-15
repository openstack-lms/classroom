"use client";

import { HiAcademicCap, HiArrowRight, HiCalendar, HiClipboard, HiUserGroup, HiChat, HiDocumentText } from "react-icons/hi";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState } from "react";

const features = [
    {
        name: 'Class Management',
        description: 'Create and organize classes with ease. Manage students, assignments, and course materials in one place.',
        icon: HiUserGroup,
    },
    {
        name: 'Assignment Tracking',
        description: 'Create, distribute, and grade assignments. Keep track of submissions and provide feedback efficiently.',
        icon: HiClipboard,
    },
    {
        name: 'Calendar Integration',
        description: 'Schedule classes, set due dates, and manage events with our integrated calendar system.',
        icon: HiCalendar,
    },
    {
        name: 'Communication Tools',
        description: 'Stay connected with announcements, messaging, and discussion forums.',
        icon: HiChat,
    },
    {
        name: 'Document Management',
        description: 'Upload, organize, and share course materials and resources securely.',
        icon: HiDocumentText,
    },
];

interface ContactProps {
 name: string;
 email: string;
 subject: 'general' | 'technical' | 'sales' | 'feature' | 'demo' | 'other';
 message: {
    remark: string;
    time: string;
    date: string;
 };
}

export default function Home() {

    const [contact, setContact] = useState<ContactProps >({
        name: "",
        email: "",
        message: {
            remark: "",
            time: "",
            date: "",
        },
        subject: "general",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(contact);

        setContact({
            name: "",
            email: "",
            message: {
                remark: "",
                time: "",
                date: "",
            },
            subject: "general",
        });
    }

    return (
        <div className="min-h-screen bg-background-muted">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center">
                    <HiAcademicCap className="mx-auto h-12 w-12 text-primary-500" />
                    <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Welcome to Easy LMS
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-foreground-muted max-w-2xl mx-auto">
                        A simple and effective learning management system for educational institutions.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/signup">
                            <Button.Primary className="flex items-center gap-2">
                                Sign up
                                <HiArrowRight className="h-5 w-5" />
                            </Button.Primary>
                        </Link>
                        <Link href="/institution/create">
                            <Button.Light className="flex items-center gap-2">
                                Create an institution
                                <HiArrowRight className="h-5 w-5" />
                            </Button.Light>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-background py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary-500">Everything you need</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Comprehensive Learning Management
                        </p>
                        <p className="mt-6 text-lg leading-8 text-foreground-muted">
                            Our platform provides all the tools you need to manage your educational institution effectively.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {features.map((feature) => (
                                <div key={feature.name} className="flex flex-col bg-background rounded-xl p-6 shadow-sm border border-border hover:border-primary-300 transition-all duration-200">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground mb-4">
                                        <feature.icon className="h-7 w-7 flex-none text-primary-500" aria-hidden="true" />
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-foreground-muted">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-600">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-background sm:text-4xl">
                            Ready to get started?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
                            Join thousands of educational institutions already using Easy LMS to transform their learning experience.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Button.Light className="bg-background hover:bg-primary-50 text-foreground">
                                Schedule a Demo
                            </Button.Light>
                            <Link href="/pricing">
                                <Button.Primary className="text-background border-background hover:bg-primary-500">
                                    Get a quote
                                </Button.Primary>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Us Section */}
            <div className="bg-background py-24 sm:py-32" id="contact">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary-500">Contact Us</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Get in Touch
                        </p>
                        <p className="mt-6 text-lg leading-8 text-foreground-muted">
                            Have questions? We're here to help. Fill out the form below and we'll get back to you shortly.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-xl">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input.Text
                                label="Name"
                                name="name"
                                id="name"
                                placeholder="Your name"
                                value={contact.name}
                                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                            />

                            <Input.Text
                                label="Email"
                                name="email"
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={contact.email}
                                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            />

                            <Input.Select
                                label="Subject"
                                name="subject"
                                id="subject"
                                value={contact.subject}
                                onChange={(e) => setContact({ ...contact, subject: e.target.value as 'general' | 'technical' | 'sales' | 'feature' | 'demo' | 'other' })}
                            >
                                <option value="general">General Inquiry</option>
                                <option value="technical">Technical Support</option>
                                <option value="sales">Sales Question</option>
                                <option value="feature">Feature Request</option>
                                <option value="demo">Demo</option>
                                <option value="other">Other</option>
                            </Input.Select>

                            {contact.subject === 'demo' && ( <>
                                <Input.Text
                                    label="Time (GMT +2)"
                                    name="end_time"
                                    id="end_time"   
                                    type="time"
                                    value={contact.message.time}
                                    onChange={(e) => setContact({ ...contact, message: {
                                        ...contact.message,
                                        time: e.target.value,
                                    } })}
                                />
                                <Input.Text
                                    label="Date"
                                    name="date"
                                    id="date"
                                    type="date"
                                    value={contact.message.date}
                                    onChange={(e) => setContact({ ...contact, message: {
                                        ...contact.message,
                                        date: e.target.value,
                                    } })}
                                />
                            </>
                            )}

                            <Input.Textarea
                                label="Message"
                                name="message"
                                id="message"
                                rows={4}
                                placeholder="How can we help you?"
                                value={contact.message.remark}
                                onChange={(e) => setContact({ ...contact, message: {
                                    ...contact.message,
                                    remark: e.target.value,
                                } })}
                            />


                            

                            <div className="flex justify-end">
                                <Button.Primary type="submit" className="w-full sm:w-auto">
                                    Send message
                                </Button.Primary>
                            </div>
                        </form>

                        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-10">
                            <div className="text-center">
                                <div className="flex justify-center items-center mb-4">
                                    <HiChat className="h-6 w-6 text-primary-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Support</h3>
                                <p className="mt-2 text-foreground-muted">
                                    alan.shen27@gmail.com
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="flex justify-center items-center mb-4">
                                    <HiUserGroup className="h-6 w-6 text-primary-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Sales</h3>
                                <p className="mt-2 text-foreground-muted">
                                    alan.shen27@gmail.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}