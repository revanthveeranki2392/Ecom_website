import { useState } from "react"
import { HiMagnifyingGlass, HiMiniXMark } from "react-icons/hi2";


const SearchBar = () => {
  

    const [ searchTerm, setSearchTerm ] = useState("");
    const [ isOpen, setIsOpen] = useState(false);

    const handleSearchToggle = () => {
        setIsOpen(!isOpen);
    }
    const handleSearch = (e) => {
        e.preventDefault();
        console.log("SearchTern : ",searchTerm);
        setIsOpen(false);
    }


    return (
        <div className={`flex items-center justify-centerw-full transition-all duration-300 ${isOpen ? "absolute top-0 left-0 w-full bg-white h-24 z-50" : "w-auto"}`}>
            {isOpen ? (
                 <form onSubmit={handleSearch}  className="relative flex item-center justify-center w-full">
                    <div className="relative w-1/2">
                        <input type = "text" placeholder="Search" value={searchTerm}
                         onChange = {(e) => setSearchTerm(e.target.value)}
                         className="bg-gray-200 px-4 py-2 pl-2 pr-12 rounded-lg w-full focus:outline-none placeholder:text-gray-700" />
                        {/* Search Icon */}
                        <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-black">
                            <HiMagnifyingGlass className="h-6 w-6" />
                        </button>
                    </div>
                    {/* Close Button */}
                    <button type="button"
                     onClick={handleSearchToggle}
                     className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-700 hover:text-gray-900">
                        <HiMiniXMark className="h-6 w-6" />
                    </button>

                 </form>
                ) : (
                <button onClick={handleSearchToggle}>
                    <HiMagnifyingGlass className="h-6 w-6" />
                </button>
            )
            }
        </div>
    )
}

export default SearchBar