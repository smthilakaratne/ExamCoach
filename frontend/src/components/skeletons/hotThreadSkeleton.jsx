import Container from "../container"
import BlockSkeleton from "./blockSkeleton"

export default function HotThreadSkeleton() {
  return new Array(3).fill(0).map(() => (
    <Container>
      <BlockSkeleton className="w-5/6 my-2" />
      <BlockSkeleton className="w-1/5 mt-4" />
    </Container>
  ))
}
