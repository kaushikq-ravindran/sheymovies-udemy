import { Col, Form, Modal, Row, Table, message } from "antd";
import React, { useEffect } from "react";
import Button from "../../../components/Button";
import { GetAllMovies } from "../../../apicalls/movies";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import {
  AddShow,
  DeleteShow,
  GetAllShowsByTheatre,
} from "../../../apicalls/theatres";
import moment from "moment";


function Analytics({ openAnalyticsModal, setOpenAnalyticsModal, theatre }) {
  const [view, setView] = React.useState("table");
  const [shows, setShows] = React.useState([]);
  const [movies, setMovies] = React.useState([]);
  const [chartData, setChartData] = React.useState({}); 
  const [movieAnalytics, setMovieAnalytics] = React.useState([]);
  const dispatch = useDispatch();

  const calculateChartData = (shows) => {
    let totalTicketCount = 0;
    let totalRevenue = 0;
    let totalSeats = 0;

    shows.forEach(show => {
      totalTicketCount += show.bookedSeats.length;
      totalRevenue += show.bookedSeats.length * show.ticketPrice;
      totalSeats += show.totalSeats;
    });


    const averageTicketPrice = totalTicketCount ? (totalRevenue / totalTicketCount) : 0;
    const averageSeatsPerShow = shows.length ? (totalSeats / shows.length) : 0;

    return [
        { name: 'Total Tkts', value: totalTicketCount },
        { name: 'Revenue', value: totalRevenue },
        { name: 'Avg Tkt Price', value: averageTicketPrice },
        { name: 'All Shows', value: shows.length },
        { name: 'Avg seats', value: averageSeatsPerShow }
      ];

  };
  
  const calculateMovieAnalytics = (shows) => {
    // Create an object to hold the total revenue for each movie
    console.log(movieAnalytics);
    const revenueByMovie = shows.reduce((acc, show) => {
      // Check if show.movie and show.movie.title exist before accessing them
      if (show.movie && show.movie.title) {
        const revenue = show.bookedSeats.length * show.ticketPrice;
        acc[show.movie.title] = (acc[show.movie.title] || 0) + revenue;
      }
      return acc;
    }, {});
  
    // Convert the object into an array of objects for the chart
    return Object.keys(revenueByMovie).map(movieName => ({
      name: movieName,
      Revenue: revenueByMovie[movieName],
    }));
  };

  const getData = async () => {
    try {
      dispatch(ShowLoading());
      const moviesResponse = await GetAllMovies();
      if (moviesResponse.success) {
        setMovies(moviesResponse.data);
      } else {
        message.error(moviesResponse.message);
      }

      const showsResponse = await GetAllShowsByTheatre({
        theatreId: theatre._id,
      });
      if (showsResponse.success) {
        setShows(showsResponse.data);
        const newChartData = calculateChartData(showsResponse.data);
        setChartData(newChartData);
        const newMovieAnalytics = calculateMovieAnalytics(showsResponse.data); // Calculate movie analytics
        setMovieAnalytics(newMovieAnalytics); // Set the movie analytics data
      } else {
        message.error(showsResponse.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
    } finally {
        dispatch(HideLoading());
      }
  };

  const handleAddShow = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await AddShow({
        ...values,
        theatre: theatre._id,
      });
      if (response.success) {
        message.success(response.message);
        getData();
        setView("table");
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteShow({ showId: id });

      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      message.error(error.message);
      dispatch(HideLoading());
    }
  };

  const columns = [
    {
      title: "Show Name",
      dataIndex: "name",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (text, record) => {
        return moment(text).format("MMM Do YYYY");
      },
    },
    {
      title: "Time",
      dataIndex: "time",
    },
    {
      title: "Movie",
      dataIndex: "movie",
      render: (text, record) => {
        return record.movie.title;
      },
    },
    {
      title: "Ticket Price",
      dataIndex: "ticketPrice",
    },
    {
      title: "Total Seats",
      dataIndex: "totalSeats",
    },
    {
      title: "Available Seats",
      dataIndex: "availableSeats",
      render: (text, record) => {
        return record.totalSeats - record.bookedSeats.length;
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-1 items-center">
            {record.bookedSeats.length === 0 && (
              <i
                className="ri-delete-bin-line"
                onClick={() => {
                  handleDelete(record._id);
                }}
              ></i>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getData();
  }, [theatre._id]);

  return (
    <Modal
      title=""
      open={openAnalyticsModal}
      onCancel={() => setOpenAnalyticsModal(false)}
      width="80%" 
      footer={null}
    >
      <h1 className="text-primary text-md uppercase mb-1">
        Theatre : {theatre.name}
      </h1>
      <hr />

      <div className="flex justify-between mt-1 mb-1 items-center">
        <h1 className="text-md uppercase">
          {view === "Analytics"}
        </h1>
      </div>
      

      {view === "graph" ? (
  <Table columns={columns} dataSource={shows} />
) : (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
    <div style={{ flex: 1 }}>
      <LineChart
        width={500} 
        height={300}
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 20, 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          interval={0}
          tick={{ fontSize: 12 }} 
          height={50} 
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
    
    <div style={{ flex: 1 }}>
    {/* New LineChart for movie revenue */}
    <LineChart
      width={500}
      height={300}
      data={movieAnalytics} // This should be your movie analytics data
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 20,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="name"
        interval={0}
        tick={{ fontSize: 12 }}
        height={50}
      />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="Revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
    </LineChart>
  </div>
  </div>
)}


      {view === "form" && (
        <Form layout="vertical" onFinish={handleAddShow}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item
                label="Show Name"
                name="name"
                rules={[{ required: true, message: "Please input show name!" }]}
              >
                <input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "Please input show date!" }]}
              >
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Time"
                name="time"
                rules={[{ required: true, message: "Please input show time!" }]}
              >
                <input type="time" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Movie"
                name="movie"
                rules={[{ required: true, message: "Please select movie!" }]}
              >
                <select>
                  <option value="">Select Movie</option>
                  {movies.map((movie) => (
                    <option value={movie._id}>{movie.title}</option>
                  ))}
                </select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Ticket Price"
                name="ticketPrice"
                rules={[
                  { required: true, message: "Please input ticket price!" },
                ]}
              >
                <input type="number" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Total Seats"
                name="totalSeats"
                rules={[
                  { required: true, message: "Please input total seats!" },
                ]}
              >
                <input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-1">
            <Button
              variant="outlined"
              title="Cancel"
              onClick={() => {
                setView("table");
              }}
            />
            <Button variant="contained" title="SAVE" type="submit" />
          </div>
        </Form>
      )}
    </Modal>
  );
}

export default Analytics;
