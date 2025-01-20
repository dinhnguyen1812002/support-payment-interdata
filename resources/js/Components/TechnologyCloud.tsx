import React from 'react';
import { IconCloud } from "@/Components/ui/icon-cloud";

const slugs = [
    "typescript",
    "javascript",
    "dart",
    "java",
    "react",
    "flutter",
    "Vuejs",
    "html5",
    "css3",
    "nodedotjs",
    "express",
    "nextdotjs",
    "dotnet",
    "prisma",
    "amazonaws",
    "postgresql",
    "firebase",
    "nginx",
    "vercel",
    "testinglibrary",
    "jest",
    "cypress",
    "docker",
    "git",
    "Spring",
    "jira",
    "github",
    "gitlab",
    "visualstudiocode",
    "sonarqube",
];

export function TechnologyCloud() {
    const images = slugs.map(
        (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`,
    );

    return (
        <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background/80 z-10" />
            <IconCloud images={images} />
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 text-foreground">
                <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h2>
                <p className="text-sm opacity-90">Đăng nhập để tiếp tục hành trình với chúng tôi</p>
            </div>
        </div>
    );
}
