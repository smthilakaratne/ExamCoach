import Container from "../container"
import BlockSkeleton from "./blockSkeleton"

export default function DetailedTagSkeleton() {
  return new Array(3).fill(0).map(() => (
    <Container>
      <BlockSkeleton />
      <p className="my-4">
        <BlockSkeleton />
        <BlockSkeleton />
      </p>
      <BlockSkeleton className="mt-5 w-36" />
    </Container>
  ))
}
