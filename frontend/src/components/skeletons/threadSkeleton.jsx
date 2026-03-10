import Container from "../container"
import BlockSkeleton from "./blockSkeleton"
import CircleSkeleton from "./circleSkeleton"

export default function ThreadSkeleton() {
  return (
    <>
      {new Array(5).fill(0).map(() => (
        <Container className="mt-5 animate-pulse">
          <BlockSkeleton />
          <div className="flex justify-between items-center mt-4">
            <BlockSkeleton className="w-40 md:w-52" />
            <div className="flex items-center gap-3">
              <CircleSkeleton size={6} />
              <BlockSkeleton className="w-20 md:w-48" />
            </div>
          </div>
        </Container>
      ))}
    </>
  )
}
