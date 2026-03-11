import React from 'react'
import PrivateRouters from './PrivateRouter'
import PublicRouters from './PublicRouter'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Login from '../Components/Auth/Login'
import Dashboard from '../Components/Admin/Dashboard'
import Register from '../Components/Auth/Register'
import AdminEnquiries from '../Components/Admin/Enquires'
import Outer from '../Partials/OuterLayout'
import AdminUsers from '../Components/Admin/Users'
import AdminProperties from '../Components/Admin/Properties'
import AddProperty from '../Components/Property/Add'
import PropertyView from '../Components/Property/View'
import PropertyEdit from '../Components/Property/Edit'
import PropertyViewList from '../Components/Property/ViewCount'
import Home from '../Components/Pages/Home'
import About from '../Components/Pages/About'
import Contact from '../Components/Pages/Contact'
import SearchProperty from '../Components/Pages/SearchProperty'
import Favourite from '../Components/Pages/Favourite'
import Payment from '../Components/Pages/Payment'
import PropertyDetails from '../Components/Pages/PropertyDetails'
import AdminDashboard from '../Components/Admin/AdminDashboard'

const index = () => {
    return (
        <React.Fragment>
            <Router>
                <Routes>
                    <Route element={<PublicRouters />}>
                        <Route element={<Outer />}>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/favourite" element={<Favourite />} />
                            <Route path="/search-property" element={<SearchProperty />} />
                            <Route path="/plans" element={<Payment />} />
                            {/* <Route path="/view-property/:id" element={<PropertyDetails />} /> */}
                        </Route>
                    </Route>
                    <Route element={<PrivateRouters allowedRoles={["user"]} />}>
                        <Route element={<Outer />}>
                            <Route path="/user/view-property/:id" element={<PropertyDetails />} />
                            <Route path="/user/properties" element={<AdminProperties />} />
                            <Route path="/user/add-property" element={<AddProperty />} />
                            <Route path="/user/view-property/:id" element={<PropertyView />} />
                            <Route path="/user/edit-property/:id" element={<PropertyEdit />} />
                        </Route>
                    </Route>
                    <Route element={<PrivateRouters allowedRoles={["admin"]} />}>
                        <Route element={<Outer />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/enquiries" element={<AdminEnquiries />} />
                            <Route path="/admin/users" element={<AdminUsers />} />
                            <Route path="/admin/properties" element={<AdminProperties />} />
                            <Route path="/admin/add-property" element={<AddProperty />} />
                            <Route path="/admin/view-property/:id" element={<PropertyView />} />
                            <Route path="/admin/edit-property/:id" element={<PropertyEdit />} />
                            <Route path="/admin/propertyviews" element={<PropertyViewList />} />
                        </Route>
                    </Route>
                    <Route element={<PrivateRouters allowedRoles={["business"]} />}>
                    </Route>
                </Routes>
            </Router>
        </React.Fragment>
    )
}

export default index