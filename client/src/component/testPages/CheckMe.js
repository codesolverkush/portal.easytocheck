import CurrentLocation from "./LocationPage";

const handleResults = (results) => console.log(results)

const onError = (type, status) => console.log(type, status)

const CheckMe = () => {
  return (
    <CurrentLocation onFetchAddress={handleResults} onError={onError}>
      {({ getCurrentLocation, loading }) => (
        <button onClick={getCurrentLocation} disabled={loading}>
          Get Current Location
        </button>
      )}
  </CurrentLocation>
  )
}

export default CheckMe