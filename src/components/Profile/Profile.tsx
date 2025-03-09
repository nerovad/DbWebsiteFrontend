import React from "react";
import "./Profile.scss";

const Profile: React.FC = () => {
  return (
    <div className="profile-page">
      <h1 className="profile-title">Your Profile</h1>

      {/* Awards Section */}
      <section className="profile-section">
        <h2>Awards</h2>
        <p>No awards yet. Start submitting your films to win!</p>
      </section>

      {/* Production Companies Section */}
      <section className="profile-section">
        <h2>Production Companies</h2>
        <p>List your production companies here.</p>
      </section>

      {/* Business Card Section */}
      <section className="profile-section">
        <h2>Business Card</h2>
        <p>Your professional contact info.</p>
      </section>
    </div>
  );
};

export default Profile;

