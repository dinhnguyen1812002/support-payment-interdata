import React from 'react';
import { Link } from "@inertiajs/react";
import { Github, Twitter, Facebook } from "lucide-react";
import {Button} from "./ui/button";
import {Separator} from "./ui/separator";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-5 flex">
            <div className="container px-4 py-8 mx-auto">
                {/*<div className="grid grid-cols-1 gap-8 md:grid-cols-4">*/}
                {/*    /!* Company Info *!/*/}
                {/*    <div className="space-y-3">*/}
                {/*        <h3 className="text-lg font-semibold">AutoPay</h3>*/}
                {/*        <p className="text-sm text-muted-foreground">*/}
                {/*            Making the world a better place through constructing elegant hierarchies.*/}
                {/*        </p>*/}
                {/*    </div>*/}

                {/*    /!* Quick Links *!/*/}
                {/*    <div className="space-y-3">*/}
                {/*        <h3 className="text-lg font-semibold">Quick Links</h3>*/}
                {/*        <div className="space-y-2">*/}
                {/*            <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground">*/}
                {/*                About Us*/}
                {/*            </Link>*/}
                {/*            <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">*/}
                {/*                Contact*/}
                {/*            </Link>*/}
                {/*            <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground">*/}
                {/*                Terms of Service*/}
                {/*            </Link>*/}
                {/*            <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">*/}
                {/*                Privacy Policy*/}
                {/*            </Link>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    /!* Resources *!/*/}
                {/*    <div className="space-y-3">*/}
                {/*        <h3 className="text-lg font-semibold">Resources</h3>*/}
                {/*        <div className="space-y-2">*/}
                {/*            <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground">*/}
                {/*                Blog*/}
                {/*            </Link>*/}
                {/*            <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground">*/}
                {/*                Documentation*/}
                {/*            </Link>*/}
                {/*            <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground">*/}
                {/*                FAQ*/}
                {/*            </Link>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    /!* Social Links *!/*/}
                {/*    <div className="space-y-3">*/}
                {/*        <h3 className="text-lg font-semibold">Follow Us</h3>*/}
                {/*        <div className="flex space-x-2">*/}
                {/*            <Button variant="ghost" size="icon">*/}
                {/*                <Github className="w-5 h-5" />*/}
                {/*            </Button>*/}
                {/*            <Button variant="ghost" size="icon">*/}
                {/*                <Twitter className="w-5 h-5" />*/}
                {/*            </Button>*/}
                {/*            <Button variant="ghost" size="icon">*/}
                {/*                <Facebook className="w-5 h-5" />*/}
                {/*            </Button>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <Separator className="my-8" />

                {/* Copyright */}
                <div className="flex flex-col justify-between items-center space-y-4 md:flex-row md:space-y-0">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} Inter Group. All rights reserved.
                    </p>
                    <div className="flex space-x-4">
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                            Terms
                        </Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                            Privacy
                        </Link>
                        <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                            Cookies
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
