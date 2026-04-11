import { Flame, MessageSquare, Search, Tag } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import Button from "../../components/button"
import ForumThread from "../../components/forumThread"
import ForumTag from "../../components/tag"
import Container from "../../components/container"
import { useState } from "react"
import { useEffect } from "react"
import { getForumTags, getThreads } from "../../services/forumApi"
import ThreadSkeleton from "../../components/skeletons/threadSkeleton"
import BlockSkeleton from "../../components/skeletons/blockSkeleton"
import HotThreadSkeleton from "../../components/skeletons/hotThreadSkeleton"

export default function Forum() {
  const [threads, setThreads] = useState([])
  const [query, setQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [threadsLoading, setThreadsLoading] = useState(true)
  const [tags, setTags] = useState([])
  const [tagsLoading, setTagsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("trending")
  const [searchParams, setSearchParams] = useSearchParams()

  const views = {
    trending: () => threads, // return all for now
    latest: () =>
      [...threads].sort(
        (t1, t2) => new Date(t2.createdAt) - new Date(t1.createdAt),
      ),
    unanswered: () => threads.filter((thread) => thread.answers.length === 0),
    "my-questions": () => threads, // everything is sample user for now
    "my-answers": () => threads, // everything is sample user for now
  }

  const hotTodayQuestions = threads?.slice(0, 3) ?? []
  const filteredThreads = views[viewMode]()

  useEffect(() => {
    const tags = query.match(/(?<=#)\w+/g)
    const normalizedQuery = encodeURIComponent(
      query.replaceAll(/#\w+/g, "").trim(),
    )
    const params = {}
    if (tags) params.tags = tags.join(",")
    if (normalizedQuery) params.q = normalizedQuery
    setSearchParams(params)
  }, [searchQuery])

  useEffect(() => {
    setThreadsLoading(true)
    let q = searchParams.get("q")
    let tags = searchParams.get("tags")?.split(",")

    if (!searchQuery) {
      const searchVal =
        (q || "") + (tags?.map((tag) => "#" + tag).join(",") || "")
      setQuery(searchVal)
      setSearchQuery(searchVal)
    }
    getThreads(q, tags)
      .then(setThreads)
      .then(() => setThreadsLoading(false))
  }, [searchParams])

  useEffect(() => {
    setTagsLoading(true)
    getForumTags()
      .then(setTags)
      .then(() => setTagsLoading(false))
  }, [])

  // credits to this hero for this quick and hacky HTML escaper
  // https://stackoverflow.com/a/22706073/9558467
  // HTML should be escaped properly to prevent XSS attacks (and also to not break the UI accidentally)
  const highlightQuery = (text) =>
    new Option(text).innerHTML.replaceAll(
      /(#\w+)/g,
      '<span class="bg-gray-300 text-gray-600 py-0.5 rounded-md">$1</span>',
    )

  return (
    <main className="m-4">
      <section className="flex gap-2 justify-between items-center">
        <div className="relative flex-auto w-0">
          <input
            type="search"
            className="relative ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto w-full bg-transparent"
            value={query}
            onChange={(evt) => setQuery(evt.target.value)}
            onKeyDown={(evt) => {
              if (evt.key === "Enter") setSearchQuery(query)
            }}
          />
          <div
            className="absolute inset-0 p-1.5 whitespace-pre pointer-events-none px-4 py-2"
            dangerouslySetInnerHTML={{ __html: highlightQuery(query) }}
          />
        </div>
        <Button className="flex gap-2 items-center">
          <Search
            className="size-5"
            onKeyDown={(evt) => {
              if (evt.key === "Enter") setSearchQuery(query)
            }}
          />
          <span onClick={() => setSearchQuery(query)}>Search</span>
        </Button>
      </section>

      <div className="grid md:flex gap-3 justify-between my-3">
        <section className="flex-auto">
          <div className="flex justify-between items-center gap-5">
            {threadsLoading ? (
              <BlockSkeleton className="w-40" />
            ) : (
              <h3 className="text-md xl:text-xl my-3">
                {threads.length} questions
              </h3>
            )}
            <div className="hidden lg:flex gap-1 border border-gray-300 rounded-sm p-1">
              <Button
                kind={viewMode === "trending" ? "primary" : "secondary"}
                className="border-0 text-xs lg:text-sm"
                onClick={() => setViewMode("trending")}
              >
                Trending
              </Button>
              <Button
                kind={viewMode === "latest" ? "primary" : "secondary"}
                className="border-0 text-xs lg:text-sm"
                onClick={() => setViewMode("latest")}
              >
                Latest
              </Button>
              <Button
                kind={viewMode === "unanswered" ? "primary" : "secondary"}
                className="border-0 text-xs lg:text-sm"
                onClick={() => setViewMode("unanswered")}
              >
                Unanswered
              </Button>
              <Button
                kind={viewMode === "my-questions" ? "primary" : "secondary"}
                className="border-0 text-xs lg:text-sm"
                onClick={() => setViewMode("my-questions")}
              >
                My Questions
              </Button>
              <Button
                kind={viewMode === "my-answers" ? "primary" : "secondary"}
                className="border-0 text-xs lg:text-sm"
                onClick={() => setViewMode("my-answers")}
              >
                My Answers
              </Button>
            </div>
            <select
              className="ring-1 ring-gray-300 px-4 py-2 rounded-sm flex-auto block lg:hidden"
              onSelect={(evt) => setViewMode(evt.target.value)}
            >
              <option value="trending">Trending</option>
              <option value="latest">Latest</option>
              <option value="unanswered">Unanswered</option>
              <option value="my-questions">My Questions</option>
              <option value="my-answers">My Answers</option>
            </select>
          </div>
          <Link to="new" className="block md:hidden my-5">
            <Button className="w-full">Ask question</Button>
          </Link>

          <section>
            {threadsLoading ? (
              <ThreadSkeleton />
            ) : filteredThreads.length === 0 ? (
              <p className="font-light text-sm text-gray-500 my-5">
                It's quite here... <Link to="./new">Start a new question</Link>{" "}
                and shake things up
              </p>
            ) : (
              <>
                {filteredThreads.map((thread, index) => (
                  <ForumThread key={`thread-${index}`} {...thread} />
                ))}
              </>
            )}
          </section>
        </section>

        <section className="border-t border-t-gray-300 md:border-l md:border-t-0 md:border-l-gray-300 pl-0 md:pl-6 py-5 max-w-max md:max-w-sm xl:max-w-md">
          <Link to="new" className="hidden md:block">
            <Button className="w-full">Ask question</Button>
          </Link>
          <section>
            <h3 className="text-xl my-3 font-bold flex gap-2 items-center">
              <Flame className="text-orange-400" />
              <span>Hot today</span>
            </h3>
            {threadsLoading ? (
              <HotThreadSkeleton />
            ) : hotTodayQuestions.length <= 0 ? (
              <p className="font-light text-sm text-gray-500">
                No sparks flying today.{" "}
                <Link to="./new">Start a new topic</Link> and light it up.
              </p>
            ) : (
              <>
                {hotTodayQuestions.slice(0, 3).map((thread) => (
                  <Link to={`./${thread._id}`}>
                    <Container className="cursor-pointer hover:bg-gray-200 transition-colors">
                      <h5 className="font-bold">{thread.title}</h5>
                      <div className="flex gap-1 items-center text-xs text-gray-500 mt-3">
                        <MessageSquare className="size-4" />
                        <span>{thread?.answers?.length ?? 0}</span>
                      </div>
                    </Container>
                  </Link>
                ))}
              </>
            )}
          </section>
          <section className="pt-3 mt-6 border-t border-t-gray-300">
            <h3 className="text-xl my-3 font-bold flex gap-2 items-center">
              <Tag className="text-gray-400" />
              <span>Explore tags</span>
            </h3>
            <div className="flex flex-wrap gap-2 my-4">
              {tagsLoading
                ? new Array(10)
                    .fill(0)
                    .map((_, index) => (
                      <BlockSkeleton
                        className="inline-block mx-1 my-1"
                        style={{ width: `${3 + (index % 4) * 2}rem` }}
                      />
                    ))
                : tags
                    .map((tag) => tag.name)
                    .slice(0, 10)
                    .map((tag, index) => (
                      <ForumTag
                        key={`tag-${index}`}
                        name={tag}
                        className="cursor-pointer hover:bg-gray-400"
                        allowNavigate={true}
                      />
                    ))}
            </div>
            <Link to="./tags">Explore more tags</Link>
          </section>
        </section>
      </div>
    </main>
  )
}
