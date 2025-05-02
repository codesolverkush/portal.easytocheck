import { Link } from "react-router-dom";

const Webtab2 = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white font-serif p-8">
      <div className="text-center">
        <div
          className="bg-center bg-no-repeat bg-cover h-96 flex items-center justify-center"
          style={{
            backgroundImage:
              "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')",
          }}
        >
          <h1 className="text-7xl font-bold text-gray-800">404</h1>
        </div>

        <div className="mt-[-50px]">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            Looks like you're lost
          </h2>
          <p className="text-gray-500 mb-6">
            The page you are looking for is not available!
          </p>

          <Link
            to="/"
            className="inline-block px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Webtab2;
