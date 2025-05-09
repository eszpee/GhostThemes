(function () {
    const paginationElement = document.querySelector('.gh-pagination');
    if (paginationElement) {
        pagination(false);
    }
})();

/* Dark mode START */
const setColorMode = (mode) => {
    // Mode was given
    if (mode) {
      // Update data-* attr on html
      document.documentElement.setAttribute('data-force-color-mode', mode);
      // Persist in local storage
      window.localStorage.setItem('color-mode', mode);
      // Make sure the checkbox is up-to-date
      document.querySelector('#toggle-darkmode').checked = (mode === 'dark');
    }
    
    // No mode given (e.g. reset)
    else {
      // Remove data-* attr from html
      document.documentElement.removeAttribute('data-force-color-mode');
      // Remove entry from local storage
      window.localStorage.removeItem('color-mode');
      // Make sure the checkbox is up-to-date, matching the system preferences
      document.querySelector('#toggle-darkmode').checked = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }
  
  document.querySelector('#toggle-darkmode').addEventListener('click', (e) => {
    setColorMode(e.target.checked ? 'dark' : 'light');
  });
  
  // document.querySelector('#reset-darkmode').addEventListener('click', (e) => {
  //   e.preventDefault();
  //   setColorMode(false);
  // });
  
  // Keep an eye out for System Light/Dark Mode Changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    // Ignore change if there's an override set
    if (document.documentElement.getAttribute('data-force-color-mode')) {
      return;
    }
  
    // Make sure the checkbox is up-to-date
    document.querySelector('#toggle-darkmode').checked = mediaQuery.matches;
  });

/* Dark mode END */

/* RSS to JSON (Substack import) start */

const feedUrl = `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fleadtime.substack.com%2Ffeed`;

window.fetchLatestPosts = async () => {
  try {
    const response = await fetch(feedUrl);
    const data = await response.json();

    if (data.items.length > 0) {

      const firstItem = data.items.shift();
      const firstHTML = `
                        <div class="gh-article-featured">
                            <div class="gh-featured-article-container">
                                <div class="gh-featured-content">
                                    <p class="gh-postlist-item">
                                        <a class="gh-postlist-title" href="${firstItem.link}">${firstItem.title}</a>
                                    </p>
                                </div>
                            </div>
                            <div class="gh-article-excerpt-container">
                                <p class="gh-article-excerpt">${firstItem.description}</p>
                            </div>
                        </div>
      `;

      const postsHTML = data.items.map(item => {
        return `
                        <p class="gh-postlist-item">
                            <a class="gh-postlist-title" href="${item.link}">${item.title}</a>
                        </p>
        `;
      }).join('');

      // Update HTML with the latest posts details
      document.getElementById('latest-posts').insertAdjacentHTML('afterbegin', firstHTML + postsHTML);
    } else {
      document.getElementById('latest-posts').textContent = 'No posts available.';
    }
  } catch (error) {
    document.getElementById('latest-posts').textContent = 'Failed to load the latest posts.';
    console.error('Error fetching the RSS feed:', error);
  }
}

/* RSS to JSON (Substack import) end */

