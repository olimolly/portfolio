// export type NavKey = "home" | "projects" | "blog" | "contact";
export type UiMessages = {
    // nav: Record<NavKey, string>;      //  strict : clés imposées
    nav: {
        home: string;
        projects: string;
        blog: string;
        contact: string;
        seeProjects: string;
    };
    home: Record<string, string>;
    projects?: Record<string, string>;
    contact: {
        title: string;
        description: string;
        headline: string;
        text: string;
        emailLabel: string;
        linkedinLabel: string;
        githubLabel: string;
        cvLabel: string;
    };
    common?: Record<string, string>;
    cta: Record<string, string>;

};