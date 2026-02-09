import { Flame, Search } from "lucide-react"
import Button from "../components/button"
import ForumTag from "../components/tag"
import DetailedTagContainer from "../components/detailedTagContainer"

const dummyDetailedTag = {
  name: "sample-tag",
  description:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo voluptates facere natus officiis sunt sequi debitis laudantium repudiandae nemo facilis, unde, quisquam ratione, non ipsam molestias ea illo qui vero!",
  relatedTopics: 999,
}

export default function ForumTags() {
  const tags = [
    "tag1",
    "tag2",
    "tag3",
    "random-tag",
    "python",
    "tag4",
    "tag5",
    "javascript",
    "tag6",
    "tag7",
  ]

  const detailedTags = [
    dummyDetailedTag,
    dummyDetailedTag,
    dummyDetailedTag,
    dummyDetailedTag,
    dummyDetailedTag,
  ]

  return (
    <main className="m-4">
      <section className="flex gap-2 justify-between items-center">
        <input
          type="search"
          className="ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto"
        />
        <Button className="flex gap-2 items-center">
          <Search className="size-5" />
          <span>Search</span>
        </Button>
      </section>

      <div className="flex gap-3 justify-between my-3">
        <section className="flex-auto">
          <h3 className="text-xl my-3">999 tags</h3>
          <section>
            {detailedTags.map((thread, index) => (
              <DetailedTagContainer key={`thread-${index}`} {...thread} />
            ))}
          </section>
        </section>

        <section className="border-l border-l-gray-300 pl-6 py-5 max-w-md">
          <h3 className="text-xl my-3 font-bold flex gap-2 items-center">
            <Flame className="text-orange-400" />
            <span>Popular tags</span>
          </h3>
          <div className="flex flex-wrap gap-2 my-4">
            {[...tags, ...tags, ...tags, ...tags, ...tags, ...tags]
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
  )
}
