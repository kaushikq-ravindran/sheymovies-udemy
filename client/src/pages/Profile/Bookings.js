import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { message, Row, Table, Col, Tabs } from "antd";
import { GetBookingsOfUser } from "../../apicalls/bookings";
import moment from "moment";

const { TabPane } = Tabs;

function Bookings() {
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetBookingsOfUser();
      if (response.success) {
        setAllBookings(response.data);
        const filteredBookings = response.data.filter(booking =>
          moment(booking.show.date).isAfter(moment().subtract(30, 'days'))
        );
        setRecentBookings(filteredBookings);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const renderBookings = (bookings) => (
    <Row gutter={[16, 16]}>
      {bookings.map((booking) => (
        <Col span={24}>
          <div className="card p-2">
            <Row gutter={[16, 16]}>
              <Col span={16}>
                <h1 className="text-xl">
                  {booking.show.movie.title} ({booking.show.movie.language})
                </h1>
                <div className="divider"></div>
                <h1 className="text-sm">
                  {booking.show.theatre.name} ({booking.show.theatre.address})
                </h1>
                <h1 className="text-sm">
                  Date & Time: {moment(booking.show.date).format("MMM Do YYYY")} -
                  {moment(booking.show.time, "HH:mm").format("hh:mm A")}
                </h1>
                <h1 className="text-sm">
                  Amount : ₹ {booking.show.ticketPrice * booking.seats.length}
                </h1>
                <h1 className="text-sm">Booking ID: {booking._id}</h1>
                <h1 className="text-sm">Seats: {booking.seats.join(", ")}</h1>
              </Col>
              <Col span={8}>
                <img
                  src={booking.show.movie.poster}
                  alt=""
                  height={100}
                  width={100}
                  className="br-1"
                />
              </Col>
            </Row>
          </div>
        </Col>
      ))}
    </Row>
  );

  return (
    <div>
    <Tabs defaultActiveKey="1">
      <TabPane tab="Recent Bookings" key="1">
        <Row gutter={[16, 16]}>
          {renderBookings(recentBookings)}
        </Row>
      </TabPane>
      <TabPane tab="All Bookings" key="2">
        <Row gutter={[16, 16]}>
          {renderBookings(allBookings)}
        </Row>
      </TabPane>
    </Tabs>
  </div>
  );
}

export default Bookings;
