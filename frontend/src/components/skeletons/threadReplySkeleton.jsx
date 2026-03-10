import Container from "../container"
import BlockSkeleton from "./blockSkeleton"
import CircleSkeleton from "./circleSkeleton"

export default function ThreadReplySkeleton() {
  return new Array(3).fill(0).map(() => (
    <Container>
      <p className="my-4">
        <BlockSkeleton />
        <BlockSkeleton />
        <BlockSkeleton className="w-1/2" />
      </p>
      <div className="flex items-center gap-5 justify-end">
        <CircleSkeleton size={6} />
        <BlockSkeleton className="w-44" />
      </div>
    </Container>
  ))
}
