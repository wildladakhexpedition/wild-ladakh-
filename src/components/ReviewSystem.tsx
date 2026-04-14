import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { Star, Quote, Shield, Trash2, Check, X, LogIn, LogOut, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Review {
  id: string;
  userName: string;
  userPhoto: string;
  rating: number;
  comment: string;
  createdAt: any;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'user' | 'admin';
}

const ADMIN_EMAIL = "wildladakhexpedition@gmail.com";

const ReviewSystem = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create user profile
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || "Anonymous",
            email: firebaseUser.email || "",
            photoURL: firebaseUser.photoURL || "",
            role: firebaseUser.email === ADMIN_EMAIL ? 'admin' : 'user'
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Reviews Listener
  useEffect(() => {
    if (!isAuthReady) return;

    // If admin, show all reviews. If user, show approved + their own.
    let q;
    if (userProfile?.role === 'admin') {
      q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'reviews'), 
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(fetchedReviews);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userProfile]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userName: userProfile.displayName,
        userPhoto: userProfile.photoURL,
        rating,
        comment,
        createdAt: Timestamp.now(),
        userId: user.uid,
        status: 'pending'
      });
      setComment("");
      setRating(5);
      setShowForm(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Submit Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    if (userProfile?.role !== 'admin') return;
    try {
      await updateDoc(doc(db, 'reviews', reviewId), { status });
    } catch (error) {
      console.error("Update Status Error:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (userProfile?.role !== 'admin') return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Header & Auth */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-gray-900 mb-2">
            Guest Experiences
          </h3>
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            {reviews.length} Verified Reviews
          </p>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-gray-50 p-2 pr-4 rounded-full border border-gray-100">
              <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-white shadow-sm" />
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wider leading-none mb-1">{user.displayName}</p>
                <p className="text-[8px] text-ladakh-accent uppercase tracking-widest font-mono">{userProfile?.role === 'admin' ? 'Administrator' : 'Explorer'}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-ladakh-accent transition-all shadow-lg"
            >
              <LogIn size={14} /> Sign in to Review
            </button>
          )}

          {user && !showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-ladakh-accent text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-ladakh-gold transition-all shadow-lg"
            >
              <MessageSquare size={14} /> Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-16 overflow-hidden"
          >
            <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-inner">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-display font-bold uppercase text-gray-900">Share Your Journey</h4>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-900">
                  <X size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Your Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`w-8 h-8 ${star <= rating ? 'fill-ladakh-gold text-ladakh-gold' : 'text-gray-200'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Your Experience</label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      maxLength={500}
                      placeholder="Tell us about your expedition..."
                      className="w-full bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-600 focus:ring-2 focus:ring-ladakh-accent/20 focus:border-ladakh-accent outline-none transition-all min-h-[150px] resize-none"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 text-right">{comment.length}/500 characters</p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-ladakh-accent transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Post Review"}
                  </button>
                </div>

                <div className="hidden md:block">
                  <div className="aspect-square rounded-3xl overflow-hidden relative">
                    <img src="https://i.pinimg.com/1200x/dc/e7/c5/dce7c5cd0a80aed4db93644bc4d1d51d.jpg" className="w-full h-full object-cover opacity-50" alt="Ladakh" />
                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                      <p className="text-gray-900 font-display font-bold uppercase text-xl leading-tight">
                        Your feedback helps us <br />
                        <span className="text-ladakh-accent">protect the wild</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 text-xs font-bold uppercase tracking-widest"
          >
            <Check size={16} /> Review submitted! It will appear once approved by our team.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
            <Quote className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">No reviews yet. Be the first to share!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <motion.div 
              key={review.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-10 rounded-[2.5rem] bg-white border ${review.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'} flex flex-col h-full relative group shadow-sm hover:shadow-xl transition-all`}
            >
              {/* Admin Badge */}
              {review.status === 'pending' && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-yellow-100 text-yellow-700 text-[8px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Shield size={10} /> Pending Approval
                </div>
              )}

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < review.rating ? 'fill-ladakh-gold text-ladakh-gold' : 'text-gray-100'}`} 
                  />
                ))}
              </div>

              <Quote className="w-10 h-10 text-ladakh-accent/10 mb-6" />
              
              <p className="text-gray-600 font-light leading-relaxed mb-8 flex-grow italic">
                "{review.comment}"
              </p>

              <div className="flex items-center justify-between pt-8 border-t border-gray-200/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold uppercase text-xs text-gray-900 tracking-wider">{review.userName}</h4>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Admin Actions */}
                {userProfile?.role === 'admin' && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {review.status === 'pending' && (
                      <button 
                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                        title="Approve"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
