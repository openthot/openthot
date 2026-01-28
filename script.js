document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-links');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
        
        // Close menu on link click
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }

    // --- Post Manager System ---
    const PostManager = {
        STORAGE_KEY: 'openthot_posts',

        getPosts: function() {
            const posts = localStorage.getItem(this.STORAGE_KEY);
            return posts ? JSON.parse(posts) : [];
        },

        savePosts: function(posts) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
        },

        addPost: function(title, content) {
            const posts = this.getPosts();
            const newPost = {
                id: Date.now().toString(),
                title,
                content, // Markdown
                date: new Date().toISOString()
            };
            posts.unshift(newPost); // Add to top
            this.savePosts(posts);
            return newPost;
        },

        seedInitialData: function() {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                const initialPosts = [
                    {
                        id: '1',
                        title: 'The Leverage of Writing',
                        content: 'Writing is not just about words. It is about **thinking**. When you write, you freeze your thoughts so you can critique them.\n\n> "Clear writing is clear thinking."\n\nBuild a habit of writing daily, even if it is just for yourself.',
                        date: new Date().toISOString()
                    },
                    {
                        id: '2',
                        title: 'System vs Goals',
                        content: 'Goals are good for setting direction, but **systems** are what make you progress.\n\n- Goals: "I want 10k subs"\n- System: "I write 1 script every Tuesday"\n\nFocus on the system.',
                        date: new Date(Date.now() - 86400000).toISOString()
                    },
                    {
                        id: '3',
                        title: 'Consistency Audit',
                        content: 'Check your last 30 days. Did you show up?\n\nConsistency > Intensity.',
                        date: new Date(Date.now() - 172800000).toISOString()
                    }
                ];
                this.savePosts(initialPosts);
            }
        },
        
        formatDate: function(isoString) {
            return new Date(isoString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Initialize Data
    PostManager.seedInitialData();

    // --- Explore Page Logic ---
    const postForm = document.getElementById('new-post-form');
    const postFeed = document.getElementById('post-feed');

    if (postFeed) {
        // Render Function
        function renderPosts() {
            const posts = PostManager.getPosts();
            postFeed.innerHTML = posts.map(post => `
                <article class="post-card">
                    <h2 class="post-title">${post.title}</h2>
                    <span class="post-date">${PostManager.formatDate(post.date)}</span>
                    <div class="post-content">
                        ${marked.parse(post.content)}
                    </div>
                </article>
            `).join('');
        }

        // Initial Render
        renderPosts();

        // Handle New Post
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('post-title').value;
                const content = document.getElementById('post-content').value;

                if (title && content) {
                    PostManager.addPost(title, content);
                    postForm.reset();
                    renderPosts();
                    // Scroll to top of feed
                    postFeed.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // --- Homepage Carousel Logic ---
    const track = document.querySelector('.carousel-track');
    if (track) {
        const posts = PostManager.getPosts().slice(0, 5); // Latest 5
        
        if (posts.length > 0) {
            // Render Slides
            track.innerHTML = posts.map(post => {
                // Strip markdown for excerpt
                const plainText = post.content.replace(/[#*`]/g, ''); 
                return `
                <div class="carousel-slide">
                    <h3 class="slide-title">${post.title}</h3>
                    <p class="slide-excerpt">${plainText}</p>
                    <a href="explore.html" class="slide-link">Read More →</a>
                </div>
            `}).join('');

            // Carousel Navigation
            let currentIndex = 0;
            const slides = document.querySelectorAll('.carousel-slide');
            const nextBtn = document.getElementById('next-btn');
            const prevBtn = document.getElementById('prev-btn');
            
            // Calculate slide width including gap
            // Using a simple step size logic. In a real responsive grid, might need ResizeObserver.
            // For now, assuming fixed step or percentage translation could work, but let's try strict index translation.
            
            function updateCarousel() {
                 const slideWidth = slides[0].getBoundingClientRect().width;
                 const gap = 32;
                 const listWidth = (slideWidth + gap) * currentIndex;
                 track.style.transform = `translateX(-${listWidth}px)`;
            }

            if(nextBtn && prevBtn) {
                nextBtn.addEventListener('click', () => {
                    if (currentIndex < slides.length - 1) {
                        currentIndex++;
                        updateCarousel();
                    } else {
                        currentIndex = 0; // Loop
                        updateCarousel();
                    }
                });

                prevBtn.addEventListener('click', () => {
                   if (currentIndex > 0) {
                       currentIndex--;
                       updateCarousel();
                   } else {
                       currentIndex = slides.length - 1; // Loop
                       updateCarousel();
                   }
                });
            }
            
            // Auto Play (Optional, can be annoying)
            // setInterval(() => {
            //     if (currentIndex < slides.length - 1) currentIndex++;
            //     else currentIndex = 0;
            //     updateCarousel();
            // }, 5000);
        }
    }
});
