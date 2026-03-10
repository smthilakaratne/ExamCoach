import { Flame, Plus, Search } from "lucide-react"
import Button from "../../components/button"
import ForumTag from "../../components/tag"
import DetailedTagContainer from "../../components/detailedTagContainer"
import DetailedTagSkeleton from "../../components/skeletons/detailedTagSkeleton"
import BlockSkeleton from "../../components/skeletons/blockSkeleton"
import { getForumTags } from "../../services/forumApi"
import { useState } from "react"
import { useEffect } from "react"
import CreateEditTagModel from "./models/createEditTagModel"
import { useAuth } from "../../contexts/AuthContext"
export default function ForumTags() {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshTags, setRefreshTags] = useState(false)
  const [searchValue, setSearhcValue] = useState("")
  const [createTagModelOpen, setCreateModelOpen] = useState(false)
  const { user } = useAuth()
  const filteredTags = tags.filter((tag) =>
    tag.name.match(new RegExp(".*" + searchValue + ".*")),
  )

  useEffect(() => {
    setLoading(true)
    getForumTags()
      .then(setTags)
      .then(() => setLoading(false))
  }, [refreshTags])

  return (
    <>
      <CreateEditTagModel
        isOpen={createTagModelOpen}
        setIsOpen={setCreateModelOpen}
        setRefreshTags={setRefreshTags}
      />
      <main className="m-4">
        <section className="flex gap-2 justify-between items-center">
          <input
            type="search"
            className="ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto"
            value={searchValue}
            onChange={(evt) => setSearhcValue(evt.target.value)}
          />
          <Button className="hidden md:flex gap-2 items-center">
            <Search className="size-5" />
            <span>Search</span>
          </Button>
        </section>

        <div className="grid md:flex gap-3 justify-between my-3">
          <section className="flex-auto">
            <div className="flex justify-between items-center">
              {loading ? (
                <BlockSkeleton className="w-40" />
              ) : (
                <h3 className="text-xl my-3">
                  {filteredTags?.length ?? 0} tags
                </h3>
              )}

              {user && user?.role === "admin" && (
                <Button
                  className="flex gap-2 items-center"
                  onClick={() => setCreateModelOpen(true)}
                >
                  <Plus />
                  <span>Create new tag</span>
                </Button>
              )}
            </div>
            <section>
              {loading ? (
                <DetailedTagSkeleton />
              ) : (
                filteredTags.map((tag, index) => (
                  <DetailedTagContainer
                    key={`tag-${index}`}
                    {...tag}
                    setRefreshTags={setRefreshTags}
                  />
                ))
              )}
            </section>
          </section>

          <section className="border-t border-t-gray-300 md:border-t-0 md:border-l md:border-l-gray-300 pl-6 py-5 max-w-full md:max-w-sm lg:max-w-md">
            <h3 className="text-xl my-3 font-bold flex gap-2 items-center">
              <Flame className="text-orange-400" />
              <span>Popular tags</span>
            </h3>
            <div className="flex flex-wrap gap-2 my-4">
              {loading
                ? new Array(40)
                    .fill(0)
                    .map((_, index) => (
                      <BlockSkeleton
                        className="inline-block mx-1 my-1"
                        style={{ width: `${3 + (index % 4) * 2}rem` }}
                      />
                    ))
                : tags
                    .map((tag) => tag.name)
                    .slice(0, 100)
                    .map((tag, index) => (
                      <ForumTag
                        key={`tag-${index}`}
                        name={tag}
                        className="cursor-pointer hover:bg-gray-400"
                      />
                    ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
