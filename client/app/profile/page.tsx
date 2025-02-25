import ProtectedRoute from "@/app/_utils/ProtectedRoute";
import { HeadingText, Container, ProgressBar } from "@/app/_brutalComponents";

const Profile = () => {
  const totalTokens = 1000;
  const usedTokens = 350;
  const remainingTokens = totalTokens - usedTokens;
  const usagePercentage = (usedTokens / totalTokens) * 100;

  const userEmail = "user@example.com";

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Container className="w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] m-4 p-4 bg-yellow-300 flex flex-col gap-4">
          <HeadingText>Profile</HeadingText>
          <div>
            <p className="font-bold">Email: {userEmail}</p>
          </div>
          <div>
            <p className="font-bold">Token Usage:</p>
            <ProgressBar
              minValue={0}
              maxValue={totalTokens}
              currentValue={usedTokens}
              showPercentage={true}
              className="hover:cursor-default"
              color={
                usagePercentage <= 35
                  ? "cyan"
                  : usagePercentage <= 70
                  ? "lime"
                  : "red"
              }
            />
            <br />
            <p className="text-sm">
              {usedTokens} / {totalTokens} Tokens used
            </p>
            <p className="text-sm">Remaining Tokens: {remainingTokens}</p>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
