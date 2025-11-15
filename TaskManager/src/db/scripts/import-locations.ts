import { supabase } from "@/config/supabase";
import logger from "@/utils/logger";
import fs from 'fs';
import path from "path";

const importCountries = async () => {
  try {
    const countries = [
      { id: 1, name: "Việt Nam" },
      { id: 2, name: "Thái Lan" },
      { id: 3, name: "Singapore" },
      { id: 4, name: "Malaysia" },
    ];

    const { data, error } = await supabase.from("countries").insert(countries).select();

    if (error) {
      throw error;
    }

    logger.info(`✅ Import thành công ${data.length} quốc gia!`);
  } catch (error: any) {
    console.log(error)
    logger.error(`💥 Import thất bại: ${error.message || error}`);
  }
};

const importProvinces = async () => {
  try {
    const filePath = path.resolve(__dirname, "../data/provinces.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileData);

    const provinces = data.map((province: { code: number; name: string; }) => {
        return {
            id: province.code,
            name: province.name,
            country_id: 1,
        }
    })

    const { data: insertedData, error } = await supabase
      .from("provinces")
      .insert(provinces)
      .select();

    if (error) throw error;

    logger.info(`✅ Import thành công ${insertedData.length} tỉnh/thành!`);

  } catch (error: any) {
    logger.error(`💥 Import thất bại: ${error.message || error}`);
  }
};

const importWards = async () => {
  try {
    const filePath = path.resolve(__dirname, "../data/wards.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileData);

    const wards = data.map((ward: { code: number; name: string; province_code: number }) => {
        return {
            id: ward.code,
            name: ward.name,
            province_id: ward.province_code,
        }
    })

    const { data: insertedData, error } = await supabase
      .from("wards")
      .insert(wards)
      .select();

    if (error) throw error;

    logger.info(`✅ Import thành công ${insertedData.length} phường!`);

  } catch (error: any) {
    logger.error(`💥 Import thất bại: ${error.message || error}`);
  }
};

const importLocations = async () => {
    await importCountries();
    await importProvinces();
    await importWards();
}
importLocations();
