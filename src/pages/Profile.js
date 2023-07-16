import React, { useState,useEffect } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import { getAuth, updateProfile } from 'firebase/auth'
import { toast } from 'react-toastify';
import { db } from '../firebase.config';
import { FiEdit } from 'react-icons/fi'
import { MdOutlineDoneAll } from 'react-icons/md'
import "../styles/profile.css";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import { BsFillArrowRightSquareFill } from 'react-icons/bs'
import ListingItem from '../components/ListingItem';

const Profile = () => {

  const auth = getAuth()
  const navigate = useNavigate()
  // eslint-disable-next-line
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("useRef", "==", auth.currentUser.uid),
        // orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      // console.log(querySnap);
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      // console.log(listings);
      setListings(listings);
      setLoading(false);
    };
    fetchUserListings();
  }, [auth.currentUser.uid]);

  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  })

  const { name, email } = formData

  const logOutHandler = () => {
    auth.signOut()
    toast.success("Successfully LogOut")
    navigate('/')
  }

  //submit button handler
  const onSubmit = async() => {
    try {
      if(auth.currentUser.displayName !== name){
        await updateProfile(auth.currentUser,{
          displayName:name
        })
        const userRef = doc(db,'users',auth.currentUser.uid)
        await updateDoc(userRef,{name})
        toast.success("User Updated")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const onChange =(e) =>{
    setFormData(prevState => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }))
  }

  //delete handler
  const onDelete = async (listingId) => {
    if (window.confirm("Are You Sure  want to delete ?")) {
      // await deleteDoc(doc, (db, "listings", listingId));
      await deleteDoc(doc(db, "listings", listingId));
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      setListings(updatedListings);
      toast.success("Listing Deleted Successfully");
    }
  };

  //edit handler
  const onEdit = (listingId,listingType) => {
      // console.log(listingType);
      // console.log(listingId);
      listingType === 'featuredListing' ?
      navigate(`/EditFeaturedListing/${listingId}`) :
      navigate(`/EditRequestedLisitng/${listingId}`) 
    
    
  };

  return (
    <Layout>
      <div className="d-flex justify-content-between px-4">
        <h4>Profile Details</h4>
        <button className='btn btn-danger' onClick={logOutHandler}>LogOut</button>
      </div>

      <div className=" container card mt-4" style={{ width: '18rem' }}>
        <div className="card-header">
          <div className="d-flex justify-content-between">
            <p>User Personal Details</p>
            <span style={{ cursor: "pointer" }}
              onClick={() => { changeDetails && onSubmit(); setChangeDetails(prevState => !prevState) }}
            >
              {changeDetails ? <MdOutlineDoneAll color="green" /> : <FiEdit color='red' />}
            </span>
          </div>
        </div>
        <div className="card-body">
          <form>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">Name</label>
              <input type="text" className="form-control" id="name" value={name} onChange={onChange} disabled={!changeDetails}/>
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
              <input type="text" className="form-control" id="email" value={email} onChange={onChange} disabled={!changeDetails} />
            </div>
          </form>
          <Link to="/create-listing"> 
            Add a Product <BsFillArrowRightSquareFill /> 
          </Link>
          <br/>
          <Link to="/request-listing">
            Request a Product <BsFillArrowRightSquareFill />
          </Link>
        </div>
      </div>
      <div className="container-fluid mt-4 your-listings">
        {listings && listings?.length > 0 && (
          <>
            <h3 className="mt-4">Your Listings</h3>
            <div>
              {listings.map((listing) => (
                <ListingItem
                  className="profile-listing"
                  key={listing.id}
                  listing={listing.data}
                  type = {listing.type}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id,listing.type)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Profile
