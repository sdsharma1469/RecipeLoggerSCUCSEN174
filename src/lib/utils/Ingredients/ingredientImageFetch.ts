const API_KEY = "AIzaSyCTcU6faQSjTpGt6ruZjZy2skUIZ-9JTDo"
const CX_ID = "82cfa845bea454ee3"

export async function fetchFoodImage(foodName: string) {
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?q=${foodName}&cx=${CX_ID}&searchType=image&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch image");
  }

  const data = await response.json();
  console.log("Google Image API Response:", data);
  return data.items?.[0]?.link || "No image found";
}