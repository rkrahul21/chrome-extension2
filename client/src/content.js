/* global chrome */



function waitForFeedPosts(callback) {
  const interval = setInterval(() => {
    let posts = document.querySelectorAll('[data-urn*="urn:li:activity"]');
    
    // Fallback selectors if main selector doesn't work
    if (posts.length === 0) {
      posts = document.querySelectorAll('[data-urn]');
    }
    if (posts.length === 0) {
      posts = document.querySelectorAll('.feed-shared-update-v2');
    }
    if (posts.length === 0) {
      posts = document.querySelectorAll('.occludable-update');
    }
    if (posts.length === 0) {
      posts = document.querySelectorAll('article');
    }
    
    if (posts.length > 0) {
      clearInterval(interval);
      console.log(`Found ${posts.length} posts on the page`);
      callback(Array.from(posts)); 
    } else {
      console.log("Waiting for posts to load...");
    }
  }, 2000);
  
  // Timeout after 30 seconds if no posts found
  setTimeout(() => {
    clearInterval(interval);
    console.log("Timeout: No posts found after 30 seconds");
    callback([]);
  }, 30000);
}

if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(["likeCount", "commentCount"], ({ likeCount, commentCount }) => {
    if (!likeCount || !commentCount) {
      console.log("No engagement counts found in storage");
      return;
    }

    waitForFeedPosts((posts) => {
      let liked = 0;
      let commented = 0;
      let currentPostIndex = 0;

      function showCompletionMessage() {
        // Create notification overlay
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #0073b1;
          color: white;
          padding: 20px 30px;
          border-radius: 10px;
          z-index: 10000;
          font-family: Arial, sans-serif;
          font-size: 16px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 2px solid #005885;
        `;
        
        notification.innerHTML = `
          <div style="margin-bottom: 10px; font-weight: bold;">🎉 LinkedIn Auto Engagement Complete!</div>
          <div>✅ Liked: ${liked} posts</div>
          <div>💬 Commented: ${commented} posts</div>
          <div style="margin-top: 15px; font-size: 14px; opacity: 0.9;">
            This message will disappear in 10 seconds
          </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 10000);

        // Add click to close functionality
        notification.addEventListener('click', () => {
          notification.remove();
        });

        // Clear storage to prevent re-execution
        chrome.storage.local.remove(["likeCount", "commentCount"]);
        
        console.log(`Auto engagement completed: ${liked} likes, ${commented} comments`);
      }

      async function processNextPost() {
        // Check if we've completed both targets
        if (liked >= likeCount && commented >= commentCount) {
          showCompletionMessage();
          return;
        }

        // Check if we have more posts to process
        if (currentPostIndex >= posts.length) {
          window.scrollBy(0, 800);
          console.log("Scrolling down to load more posts...");
          
          // Wait for new posts to load
          setTimeout(() => {
            const newPosts = document.querySelectorAll('[data-urn]');
            if (newPosts.length > posts.length) {
              console.log(`Found ${newPosts.length - posts.length} new posts`);
              for (let i = posts.length; i < newPosts.length; i++) {
                posts.push(newPosts[i]);
              }
              processNextPost();
            } else {
              console.log("No more posts available, showing completion");
              showCompletionMessage();
            }
          }, 3000);
          return;
        }

        const post = posts[currentPostIndex];
        console.log(`Processing post ${currentPostIndex + 1}...`);

        // Like the post if we haven't reached the like target
        if (liked < likeCount) {
          const likeButton = post.querySelector('button[aria-label*="Like"]') ||
                            post.querySelector('button[data-control-name*="like"]') ||
                            post.querySelector('button.react-button__trigger') ||
                            post.querySelector('button[data-control-name="reactions_menu_trigger"]');
          
          if (likeButton) {
            // Check if already liked
            const isAlreadyLiked = likeButton.getAttribute('aria-pressed') === 'true' || 
                                 likeButton.classList.contains('react-button__trigger--pressed') ||
                                 likeButton.querySelector('svg')?.classList.contains('contextual-sign-in-modal__modal-dismiss-icon');
            
            if (!isAlreadyLiked) {
              likeButton.click();
              liked++;
              console.log(`✅ Liked post ${liked}/${likeCount}`);
            } else {
              console.log(`Post ${currentPostIndex + 1} already liked, skipping...`);
            }
          } else {
            console.log(`Like button not found for post ${currentPostIndex + 1}`);
          }
        }

        setTimeout(async () => {
          if (commented < commentCount) {
            const commentButton = post.querySelector('button[aria-label*="Comment"]') ||
                                 post.querySelector('button[data-control-name*="comment"]') ||
                                 post.querySelector('button[data-control-name="comment_toggle"]');
            
            if (commentButton) {
              commentButton.click();
              console.log(`Opening comment box for post ${currentPostIndex + 1}...`);
              
              setTimeout(() => {
                const textbox = post.querySelector('div[role="textbox"]') ||
                               post.querySelector('div[data-placeholder="Add a comment…"]') ||
                               post.querySelector('div[contenteditable="true"]') ||
                               post.querySelector('.ql-editor') ||
                               post.querySelector('div[data-placeholder*="comment"]');
                
                if (textbox) {
                  textbox.focus();
                  textbox.innerHTML = 'CFBR';
                  textbox.textContent = 'CFBR';
                  
                  const events = ['input', 'change', 'keyup', 'paste'];
                  events.forEach(eventType => {
                    const event = new Event(eventType, { bubbles: true });
                    textbox.dispatchEvent(event);
                  });
                  
                  console.log(`Added comment text to post ${currentPostIndex + 1}`);
                  
                  setTimeout(() => {
                    let submitButton = post.querySelector('button[aria-label*="Post comment"]') ||
                                      post.querySelector('button[data-control-name="comment.post"]') ||
                                      post.querySelector('button[type="submit"]') ||
                                      post.querySelector('.comments-comment-box__submit-button') ||
                                      post.querySelector('button.comments-comment-box__submit-button--cr');
                    
                    if (!submitButton) {
                      const buttons = post.querySelectorAll('button');
                      for (let button of buttons) {
                        if (button.textContent && button.textContent.trim().toLowerCase().includes('post')) {
                          submitButton = button;
                          break;
                        }
                      }
                    }
                    
                    if (submitButton && !submitButton.disabled) {
                      submitButton.click();
                      commented++;
                      console.log(`💬 Commented on post ${commented}/${commentCount}`);
                    } else {
                      console.log(`Submit button not found or disabled for post ${currentPostIndex + 1}`);
                    }
                    
                    currentPostIndex++;
                    
                    setTimeout(() => {
                      processNextPost();
                    }, 2000);
                    
                  }, 1500);
                } else {
                  console.log(`Comment textbox not found for post ${currentPostIndex + 1}`);
                
                  currentPostIndex++;
                  setTimeout(() => {
                    processNextPost();
                  }, 2000);
                }
              }, 2000);
            } else {
              console.log(`Comment button not found for post ${currentPostIndex + 1}`);
      
              currentPostIndex++;
              setTimeout(() => {
                processNextPost();
              }, 2000);
            }
          } else {
         
            currentPostIndex++;
            setTimeout(() => {
              processNextPost();
            }, 2000);
          }
        }, 2000);
      }

      console.log(`Starting engagement: Target ${likeCount} likes, ${commentCount} comments`);
      console.log(`Found ${posts.length} initial posts`);
      processNextPost();
    });
  });
} else {
  console.error("Chrome storage API is not available.");
}
