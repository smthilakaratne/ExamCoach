import { Flame, MessageSquare, Search, Tag } from "lucide-react"
import { Link } from "react-router-dom"
import Button from "../../components/button"
import ForumThread from "../../components/forumThread"
import ForumTag from "../../components/tag"
import Container from "../../components/container"
import { useState } from "react"
import { useEffect } from "react"

const { VITE_API_URL } = import.meta.env

export default function Forum() {
  const [threads, setThreads] = useState([])
  const hotTodayQuestions = threads?.slice(0, 3) ?? []
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

  useEffect(() => {
    ;(async () => {
      const response = await fetch(`${VITE_API_URL}/api/forum`)
      const result = await response.json()
      console.log(result?.body ?? [])
      setThreads(result?.body ?? [])
    })()
  }, [])

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
          <div className="flex justify-between items-center">
            <h3 className="text-xl my-3">{threads.length} questions</h3>
            <div className="flex gap-1 border border-gray-300 rounded-sm p-1">
              <Button kind="primary" className="text-sm">
                Trending
              </Button>
              <Button kind="secondary" className="border-0 text-sm">
                Latest
              </Button>
              <Button kind="secondary" className="border-0 text-sm">
                Unanswered
              </Button>
              <Button kind="secondary" className="border-0 text-sm">
                My Questions
              </Button>
              <Button kind="secondary" className="border-0 text-sm">
                My Answers
              </Button>
            </div>
          </div>

          <section>
            {threads.length === 0 ? (
              <p className="font-light text-sm text-gray-500">
                It's quite here... <a>Start a new question</a> and shake things
                up
              </p>
            ) : (
              <>
                {threads.map((thread, index) => (
                  <ForumThread key={`thread-${index}`} {...thread} />
                ))}
              </>
            )}
          </section>
        </section>

        <section className="border-l border-l-gray-300 pl-6 py-5 max-w-md">
          <Link to="new">
            <Button className="w-full">Ask question</Button>
          </Link>
          <section>
            <h3 className="text-xl my-3 font-bold flex gap-2 items-center">
              <Flame className="text-orange-400" />
              <span>Hot today</span>
            </h3>
            {hotTodayQuestions.length <= 0 ? (
              <p className="font-light text-sm text-gray-500">
                No sparks flying today. <a>Start a new topic</a> and light it
                up.
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
              {tags.slice(0, 10).map((tag, index) => (
                <ForumTag
                  key={`tag-${index}`}
                  name={tag}
                  className="cursor-pointer hover:bg-gray-400"
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
