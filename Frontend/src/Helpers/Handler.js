import ApiCall from "./ApiCall";
import { deleteAllCookies, reloadWindow } from "./Utils";

const Handler = async ({ method, url, data = {}, headers = {} }) => {
    let responseData = {};

    try {
        const response = await ApiCall({ url, method, data, headers });

        // ZIP Download
        if (headers['Content-Type'] === 'application/zip') {
            responseData.success = true;
            responseData.data = response;

        // Your API format → { status: "success", data: {...} }
        } else if (response?.status === "success") {
            responseData.success = true;
            responseData.data = response;

        // Old format → { success: true }
        } else if (response?.success === true) {
            responseData.success = true;
            responseData.data = response;

        } else {
            responseData.success = false;
            responseData.data = response;
        }

    } catch (error) {
        responseData.success = false;
        responseData.data =
            error?.response?.data || { message: "Retry after sometime" };
    }

    // 🔥 Handle Unauthorized
    if (responseData?.data?.status === 401 || responseData?.data?.status === 504) {
        deleteAllCookies();
        reloadWindow();
    }

    if (responseData.success) {
        return {
            success: true,
            data: responseData.data?.data || responseData.data,
            message: responseData.data?.msg || responseData.data?.message,
            page: responseData.data?.page,
            total: responseData.data?.total,
            limit: responseData.data?.limit,
            token: responseData.data?.token
        };
    }

    return {
        success: false,
        message:
            responseData.data?.msg ||
            responseData.data?.message ||
            "Something went wrong"
    };
};

export default Handler;
