export type StaticTestimonial = {
  id: string;
  student_name: string;
  review: string;
  image_url: string | null;
  rating: number;
  country: string | null;
  university: string | null;
  course: string | null;
};

export const STATIC_TESTIMONIALS: StaticTestimonial[] = [
  {
    id: "1",
    student_name: "Priya Sharma",
    country: "🇺🇸 USA",
    university: "University of Southern California",
    review:
      "MVR Consultants made my dream of studying in the US a reality. From shortlisting universities to visa approval — seamless experience!",
    rating: 5,
    course: "MS Computer Science",
    image_url: null,
  },
  {
    id: "2",
    student_name: "Rahul Verma",
    country: "🇨🇦 Canada",
    university: "University of Toronto",
    review:
      "The scholarship guidance from MVR saved me over $15,000. I can't recommend them enough for Canadian study abroad planning.",
    rating: 5,
    course: "MBA Finance",
    image_url: null,
  },
  {
    id: "3",
    student_name: "Ananya Pillai",
    country: "🇬🇧 UK",
    university: "University of Edinburgh",
    review:
      "Exceptional visa support — 98% success rate is no joke. My student visa was approved in just 3 weeks with their help.",
    rating: 5,
    course: "MSc Data Science",
    image_url: null,
  },
];
