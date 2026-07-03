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

export async function schedulePost(postText, postDate) {
  const { data } = await api.post("/share-post/schedule-posts", {
    post_text: postText,
    post_date: postDate,
  });
  return data;
}

export async function getScheduledPosts() {
  const { data } = await api.get("/share-post/posts");
  return data;
}
