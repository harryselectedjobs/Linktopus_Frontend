import api from "./api";

export async function generatePostVariations(userInput) {
  const { data } = await api.post("/share-post/generate", {
    user_input: userInput,
  });
  return data.posts;
}

export async function publishPost(postText) {
  const { data } = await api.post("/share-post/publish", {
    post_text: postText,
  });
  return data;
}

export async function publishPostToPage(postText) {
  const { data } = await api.post("/share-post/page", {
    text: postText,
  });
  return data;
}

export async function schedulePost(postText, postDate, accountType = "account") {
  const { data } = await api.post("/share-post/schedule-posts", {
    post_text: postText,
    post_date: postDate,
    account_type: accountType,
  });
  return data;
}

export async function getScheduledPosts() {
  const { data } = await api.get("/share-post/posts");
  return data;
}
