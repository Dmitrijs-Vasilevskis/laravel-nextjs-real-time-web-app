import { useState, useRef, useCallback, useEffect } from 'react';
import { useDebounce } from '../utils/useDebounce';
import { FriendInterface } from '@/types/User/Firendship';
import { useFriendshipContext } from '../context/friendshipContext';
import { fetchSortedFriends } from '@/services/api/firendship';

export const useFriendship = () => {

    const {
        friendList,
        pendingRequests,
        isLoading,
        selectedChat,
        handleSelectChat,
        fetchFriendList,
        fetchPending,
        updateUnreadCount,
        sendRequest,
        acceptRequest,
        declineRequest,
        isUserInFriendList,
        handleFriendRequestAccepted,
        handleFriendRequestPending,
        handleFriendRequestDeclined
    } = useFriendshipContext();

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<FriendInterface[]>([]);
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const searchCache = useRef<Map<string, FriendInterface[]>>(new Map());
    const displayFriends = searchQuery ? searchResults : friendList;
    
    const friendById = new Map(
        friendList.map((friend) => [friend.data.id, friend])
    );

    useEffect(() => {
        const performSearch = async (query: string) => {
            if (!query.trim()) {
                setSearchResults([]);
                setIsSearching(false);
    
                return;
            }
    
            if (searchCache.current.has(query)) {
                setSearchResults(searchCache.current.get(query)!);
    
                return;
            }
    
            setIsSearching(true);
    
            try {
                const { sortedFriendList } = await fetchSortedFriends(query);
                searchCache.current.set(query, sortedFriendList);

                setSearchResults(sortedFriendList);
            } catch (error: any) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }

        performSearch(debouncedSearchQuery);
        
    }, [debouncedSearchQuery]);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setSearchResults([]);
        setIsSearching(false);
    }, []);

    return {
        friends: displayFriends,
        friendById,
        pendingRequests,
        selectedChat,
        handleSelectChat,
        sendRequest,
        acceptRequest,
        declineRequest,
        updateUnreadCount,
        searchQuery,
        isSearching,
        isSearchActive: !!searchQuery,
        handleSearch,
        clearSearch,
        originalFriendList: friendList,
        searchResults,
        isUserInFriendList,
        handleFriendRequestAccepted,
        handleFriendRequestPending,
        handleFriendRequestDeclined
    };
}