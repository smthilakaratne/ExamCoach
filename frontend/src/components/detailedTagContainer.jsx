import Container from "./container"

export default function DetailedTagContainer(props) {
  return (
    <Container>
      <h4 className="text-xl font-bold my-2"># {props.name}</h4>
      <p>{props.description}</p>
      <div className="mt-5 text-sm text-gray-500">
        <b>{props.relatedTopics ?? 0}</b> related topics
      </div>
    </Container>
  )
}
