//homepage for now
import Auth from "../../app/server/auth/authentication";
import logo2 from "../public/images/btt_logo2.png";

export default function Home() {
  return (
   <div className="min-h-screen w-full px-4 py-4 sm:py-6 md:py-0 md:flex md:items-center">
  <div className="mx-auto w-full max-w-5xl">
    <div className="flex flex-col items-center gap-6 sm:gap-8 md:flex-row md:items-center md:justify-between">
      
      {/* LEFT */}
      <div className="w-full md:w-1/2">
        <div className="mx-auto flex flex-col items-center text-center md:mx-0 md:items-start md:text-left md:max-w-sm">
          <img
            className="w-36 sm:w-44 md:w-56 rounded-lg self-center"
            src={logo2}
            alt="Bar Time Trivia"
          />

          <p className="atma-thin mt-4 sm:mt-5 text-sm sm:text-base leading-snug">
            Bar Style Trivia in the palm of your hand. Log in to create trivia
            games, run a trivia session, or play live using your player
            profile.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 md:flex md:justify-end">
        <div className="w-full max-w-sm">
          <Auth />
        </div>
      </div>

    </div>
  </div>
</div>
  );
}
