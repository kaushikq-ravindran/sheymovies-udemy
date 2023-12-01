import React, { useEffect, useState } from "react";
import { GetAllTheatres, UpdateTheatre, DeleteTheatre } from "../../apicalls/theatres";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, ShowLoading } from "../../redux/loadersSlice";
import { message, Table } from "antd";
import Button from "../../components/Button";

import TheatreForm from "../Profile/TheatreForm";
import Shows from "../Profile/Shows";
import Analytics from "../Profile/Analytics";

function TheatresList() {
  const [theatres = [], setTheatres] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users);
  const [showTheatreFormModal = false, setShowTheatreFormModal] =
    useState(false);
    const [selectedTheatre = null, setSelectedTheatre] = useState(null);
    const [formType = "add", setFormType] = useState("add");
    const [openShowsModal = false, setOpenShowsModal] = useState(false);
    const [openAnalyticsModal = false, setOpenAnalyticsModal] = useState(false);

    const getData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetAllTheatres();
      if (response.success) {
        setTheatres(response.data);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await DeleteTheatre({ theatreId: id });
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-1 items-center">
            <i
              className="ri-delete-bin-line"
              onClick={() => {
                handleDelete(record._id);
              }}
            ></i>
            <i
              className="ri-pencil-line"
              onClick={() => {
                setFormType("edit");
                setSelectedTheatre(record);
                setShowTheatreFormModal(true);
              }}
            ></i>

            {(
              <span
                className="underline"
                onClick={() => {
                  setSelectedTheatre(record);
                  setOpenShowsModal(true);
                }}
              >
                Shows
              </span>
            )}
            {(
              <span
                className="underline"
                onClick={() => {
                  setSelectedTheatre(record);
                  setOpenAnalyticsModal(true);
                }}
              >
                Analytics
              </span>
            )}
                      </div>
        );
      },
    },

  ];

  useEffect(() => {
    getData();
  }, []);
  return (
    <div>
      <div className="flex justify-end mb-1">
        <Button
          variant="outlined"
          title="Add Theatre"
          onClick={() => {
            setFormType("add");
            setShowTheatreFormModal(true);
          }}
        />
      </div>

      <Table columns={columns} dataSource={theatres} />

      {showTheatreFormModal && (
        <TheatreForm
          showTheatreFormModal={showTheatreFormModal}
          setShowTheatreFormModal={setShowTheatreFormModal}
          formType={formType}
          setFormType={setFormType}
          selectedTheatre={selectedTheatre}
          setSelectedTheatre={setSelectedTheatre}
          getData={getData}
        />
      )}

      {openShowsModal && (
        <Shows
          openShowsModal={openShowsModal}
          setOpenShowsModal={setOpenShowsModal}
          theatre={selectedTheatre}
        />
      )}

      {openAnalyticsModal && (
        <Analytics
          openAnalyticsModal={openAnalyticsModal}
          setOpenAnalyticsModal={setOpenAnalyticsModal}
          theatre={selectedTheatre}
        />
      )}
    </div>
  );
}

export default TheatresList;
