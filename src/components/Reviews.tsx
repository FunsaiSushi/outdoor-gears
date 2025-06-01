import React, { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";

interface Review {
  id: string;
  rentalId: string;
  gearName: string;
  userEmail: string;
  review: string;
  date: string;
}

interface Rental {
  id: string;
  gearName: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  userEmail: string;
}

// Example reviews data
const exampleReviews = [
  {
    id: 1,
    author: "John D.",
    rating: 5,
    date: "2024-03-15",
    comment:
      "Excellent gear, exactly what I needed for my hiking trip. Very well maintained.",
    verified: true,
  },
  {
    id: 2,
    author: "Sarah M.",
    rating: 4,
    date: "2024-03-10",
    comment:
      "Great quality equipment. The pickup process was smooth. Would rent again.",
    verified: true,
  },
  {
    id: 3,
    author: "Mike R.",
    rating: 5,
    date: "2024-03-05",
    comment:
      "Perfect condition, made my camping trip so much better. Highly recommend!",
    verified: true,
  },
];

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <FiStar
          key={index}
          className={`w-4 h-4 ${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

interface ReviewsProps {
  gearName?: string;
}

const Reviews: React.FC<ReviewsProps> = ({ gearName }) => {
  const [hasRented, setHasRented] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.email) return;

    // Get rentals from localStorage
    const rentals = JSON.parse(localStorage.getItem("rentals") || "[]");
    const userRentals = rentals.filter(
      (rental: Rental) =>
        rental.userEmail === currentUser.email &&
        rental.gearName === gearName &&
        rental.status === "completed"
    );
    setHasRented(userRentals.length > 0);

    // Get reviews from localStorage
    const storedReviews = JSON.parse(localStorage.getItem("reviews") || "[]");
    const gearReviews = storedReviews.filter(
      (review: Review) => review.gearName === gearName
    );
    setReviews(gearReviews);
  }, [gearName]);

  if (!hasRented) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">{renderStars(4.7)}</div>
            <span className="text-lg font-medium text-gray-900">4.7</span>
            <span className="text-sm text-gray-500">
              ({exampleReviews.length} reviews)
            </span>
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <p className="text-amber-800">
            You can review this product after completing your rental. Reviews
            help other customers make informed decisions about their gear
            choices.
          </p>
        </div>
        <div className="space-y-4">
          {exampleReviews.map((review) => (
            <div key={review.id} className="border rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Verified Rental
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Customer Reviews
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center">{renderStars(4.7)}</div>
          <span className="text-lg font-medium text-gray-900">4.7</span>
          <span className="text-sm text-gray-500">
            ({exampleReviews.length + reviews.length} reviews)
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">You</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Your Review
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">{review.review}</p>
          </div>
        ))}
        {exampleReviews.map((review) => (
          <div key={review.id} className="border rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {review.author}
                  </span>
                  {review.verified && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Verified Rental
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
