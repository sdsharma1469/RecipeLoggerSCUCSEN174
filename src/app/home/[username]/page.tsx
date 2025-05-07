import { getUserProfileByUsername } from '@/lib/utils/UserHandling/getUserByUsername'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import RecipeCard from '@/app/components/UserPage/recipeCard'
import Navbar from '@/app/components/navbar'
import { RecipeList } from '@/types/RecipeList'

interface Props {
  params: { username: string }
}

export default async function UserHomePage(props: Props) {
  const { params } = await props
  const { username } = await params
  const profile = await getUserProfileByUsername(username)
  console.log('🧪 Is uploadedRecipes a RecipeList?', profile!.uploadedRecipes instanceof RecipeList)
  console.log('🧪 uploadedRecipes:', profile!.uploadedRecipes)
  
  if (!profile) {
    console.log('❌ No user found for:', username)
    return notFound()
  }

  const uploadedList: RecipeList = profile.uploadedRecipes!
  const uploadedIds: string[] = uploadedList.toArray();
  
  const savedList : RecipeList = profile.savedRecipes!
  const savedIds : string[] = savedList.toArray();

  return ( 
    <>
      <Navbar />

      <main className="p-8 flex flex-col items-center text-center">
        <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
          {profile.photoURL ? (
            <Image
              src={profile.photoURL}
              alt="Profile Picture"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">No Photo</span>
            </div>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold">{profile.name}</h1>
        <p className="text-gray-500">@{profile.username}</p>

        {/* Uploaded Recipes */}
        <section className="mt-12 w-full max-w-6xl text-left">
          <h2 className="text-2xl font-semibold mb-4">Uploaded Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {uploadedIds.length === 0 ? (
              <p className="col-span-full text-gray-500">No uploaded recipes yet.</p>
            ) : (
              uploadedIds.map((id, i) => (
                <RecipeCard
                  key={i}
                  title={`Recipe ${id}`} // Placeholder title
                  author={profile.username ?? "No Author"}
                  imageUrl="https://via.placeholder.com/300x200"
                  score={0}
                />
              ))
            )}
          </div>
        </section>

        {/* Saved Recipes */}
        <section className="mt-12 w-full max-w-6xl text-left">
          <h2 className="text-2xl font-semibold mb-4">Saved Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {savedIds.length === 0 ? (
              <p className="col-span-full text-gray-500">No saved recipes yet.</p>
            ) : (
              savedIds.map((id, i) => (
                <RecipeCard
                  key={i}
                  title={`Recipe ${id}`} // Placeholder
                  author={`Unknown`} // Optional: fetch actual author later
                  imageUrl="https://via.placeholder.com/300x200"
                  score={0}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </>
  )
}
